import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react';
import { useSearch } from '@tanstack/react-router';
import { type PackageData } from '../../../services/api/packageApi';
import { bookingApi } from '../../../services/api/bookingApi';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';
import { CheckAvailabilityModal } from '../components/CheckAvailabilityModal';
import { SmallLocationPicker } from '../../../components/MapLocationPicker';
import {
    Check,
    Package as PackageIcon,
    MapPin,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    ChevronLeft,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { ROUTES } from '../../../constants/routes';

interface BookingFormData {
    date: Date | null;
    startTime: string;
    location: string;
    lat: number | null;
    lng: number | null;
    eventType: string;
    contactName: string;
    email: string;
    phone: string;
    photographerId: string;
    packageId: string | null;
}

function BookingWizard() {
    const search: { photographerId?: string; packageId?: string; date?: string } = useSearch({ strict: false });
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [photographerName, setPhotographerName] = useState("");
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

    const [formData, setFormData] = useState<BookingFormData>({
        date: search.date ? new Date(search.date) : null,
        startTime: '',
        location: '',
        lat: null,
        lng: null,
        eventType: '',
        contactName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        photographerId: search.photographerId || '',
        packageId: search.packageId || null
    });


    const loadInitialData = useCallback(async (id: string) => {
        try {
            setLoading(true);

            const photog = await userPhotographerApi.getPhotographerById(id);

            setPhotographerName(photog.name);

            const loadedPackages = photog.packages || [];
            setPackages(loadedPackages);


            if (search.packageId) {
                const found = loadedPackages.find((p: any) => p.id === search.packageId);
                if (found) {
                    setStep(2);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load booking details");
        } finally {
            setLoading(false);
        }
    }, [search.packageId]);


    useEffect(() => {

        if (!user) {
            toast.error("Please login to book a session");
            navigate({ to: ROUTES.AUTH.LOGIN } as any);
            return;
        }

        if (search.photographerId) {
            loadInitialData(search.photographerId);
        } else {
            setLoading(false);
        }
    }, [search.photographerId, user, navigate, loadInitialData]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.packageId) {
                toast.error("Please select a package");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            handleSubmit();
        }
    };

    const handlePrevStep = () => {
        if (step === 1) {
            navigate({ to: ROUTES.USER.PHOTOGRAPHER_DETAILS, params: { id: formData.photographerId } } as any);
        } else {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {

        const newErrors: { [key: string]: string } = {};
        if (!formData.date) newErrors.date = "Event date is required";
        if (!formData.startTime) newErrors.startTime = "Start time is required";
        if (!formData.location) newErrors.location = "Location is required";
        if (!formData.eventType) newErrors.eventType = "Event type is required";
        if (!formData.contactName) newErrors.contactName = "Contact name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const selectedPackage = packages.find(p => p.id === formData.packageId);
            if (!selectedPackage) {
                toast.error("Invalid package selected");
                return;
            }

            await bookingApi.createBooking({
                ...formData,
                date: formData.date?.toISOString(),
                packageName: selectedPackage.name,
                packagePrice: selectedPackage.price,
                packageFeatures: selectedPackage.features
            } as any);

            toast.success("Booking request sent successfully!");
            setStep(3);
        } catch (error: any) {
            console.error("Booking Error:", error);
            toast.error(error.response?.data?.message || "Failed to submit booking request");
        }
    };

    if (!search.photographerId) {
        return <div className="p-10 text-center text-red-500">Invalid Booking Link</div>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">

            <div className="max-w-4xl mx-auto mb-10 text-center">
                <div
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4 cursor-pointer hover:text-green-700 transition"
                    onClick={() => navigate({ to: ROUTES.USER.PHOTOGRAPHER_DETAILS, params: { id: formData.photographerId } } as any)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            navigate({ to: ROUTES.USER.PHOTOGRAPHER_DETAILS, params: { id: formData.photographerId } } as any);
                        }
                    }}
                >
                    <ChevronLeft size={16} />
                    Back to Photographer
                </div>
                <h1 className="text-3xl font-serif text-gray-900 mb-2">
                    Book Your Session <span className="text-gray-400 text-lg font-sans not-italic">with {photographerName}</span>
                </h1>

                <div className="flex items-center justify-center gap-4 mt-6">
                    <StepIndicator current={step} number={1} icon={<PackageIcon size={16} />} />
                    <div className={`w-16 h-0.5 ${step > 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
                    <StepIndicator current={step} number={2} icon={<Calendar size={16} />} />
                    <div className={`w-16 h-0.5 ${step > 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
                    <StepIndicator current={step} number={3} icon={<Check size={16} />} />
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <AnimatePresence mode='wait'>

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Choose Your Photography Package</h2>
                                <p className="text-gray-500">Select the package that best fits your needs</p>
                            </div>

                            {packages.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500">No packages available for this photographer.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setFormData({ ...formData, packageId: pkg.id || null })
                                                }
                                            }}
                                            ref={el => {
                                                if (formData.packageId === pkg.id && el) {
                                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                            }}
                                            onClick={() => setFormData({ ...formData, packageId: pkg.id || null })}
                                            className={`bg-white rounded-2xl p-6 cursor-pointer transition-all border-2 relative
                                      ${formData.packageId === pkg.id
                                                    ? 'border-green-600 shadow-xl scale-[1.02] ring-1 ring-green-600'
                                                    : 'border-transparent shadow-sm hover:shadow-md hover:border-green-200'
                                                }`}
                                        >
                                            {formData.packageId === pkg.id && (
                                                <div className="absolute top-4 right-4 bg-green-600 text-white p-1 rounded-full shadow-lg">
                                                    <Check size={16} />
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                            <p className="text-3xl font-bold text-green-700 mb-4">${pkg.price}</p>

                                            <ul className="space-y-3 mb-6">
                                                {pkg.features.map((f, i) => (
                                                    <li key={i} className="flex items-start text-sm text-gray-600">
                                                        <Check size={14} className="text-green-500 mr-2 mt-1 shrink-0" />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end mt-8">
                                <button
                                    onClick={handleNextStep}
                                    disabled={!formData.packageId}
                                    className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-200/50"
                                >
                                    Next Step
                                    <ArrowRight size={18} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Event Details</h2>
                                <p className="text-gray-500">Tell us about your photography session</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                                        <div
                                            className="relative cursor-pointer"
                                            onClick={() => setIsAvailabilityModalOpen(true)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setIsAvailabilityModalOpen(true)
                                                }
                                            }}
                                        >
                                            <input
                                                readOnly
                                                value={formData.date ? formData.date.toLocaleDateString() : ''}
                                                placeholder="dd mm yyyy"
                                                className={`w-full pl-4 pr-10 py-3 rounded-lg border bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.date ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Time * <span className="text-xs text-gray-400 font-normal">(AM/PM)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, startTime: e.target.value });
                                                    setErrors({ ...errors, startTime: '' });
                                                }}
                                                className={`w-full pl-4 pr-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.startTime ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                        {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Location *</label>
                                    <SmallLocationPicker
                                        label="Search Location"
                                        initialLat={formData.lat || undefined}
                                        initialLng={formData.lng || undefined}
                                        onLocationSelect={(loc) => {
                                            setFormData({
                                                ...formData,
                                                location: loc.address,
                                                lat: loc.lat,
                                                lng: loc.lng
                                            });
                                            setErrors({ ...errors, location: '' });
                                        }}
                                    />
                                    {formData.location && <p className="text-xs text-green-600 mt-1 flex items-center"><MapPin size={12} className="mr-1" /> {formData.location}</p>}
                                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                                    <select
                                        value={formData.eventType}
                                        onChange={(e) => {
                                            setFormData({ ...formData, eventType: e.target.value });
                                            setErrors({ ...errors, eventType: '' });
                                        }}
                                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.eventType ? 'border-red-500' : 'border-gray-200'}`}
                                    >
                                        <option value="">Select event type</option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Portrait">Portrait</option>
                                        <option value="Event">Event</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
                                </div>

                                <hr className="border-gray-100 my-4" />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                                    <div className="relative">
                                        <input
                                            value={formData.contactName}
                                            onChange={(e) => {
                                                setFormData({ ...formData, contactName: e.target.value });
                                                setErrors({ ...errors, contactName: '' });
                                            }}
                                            placeholder="Your Full Name"
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.contactName ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                    {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    setErrors({ ...errors, email: '' });
                                                }}
                                                placeholder="your@email.com"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, phone: e.target.value });
                                                    setErrors({ ...errors, phone: '' });
                                                }}
                                                placeholder="(555) 123-4567"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>


                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        className="flex-1 py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors shadow-lg"
                                    >
                                        Request Booking
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-10 text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={40} className="text-green-600" />
                            </div>

                            <h2 className="text-3xl font-serif text-gray-900 mb-2">Request Sent!</h2>
                            <p className="text-gray-500 mb-8">
                                Your booking request has been sent to <span className="font-bold text-gray-800">{photographerName}</span>.
                                You will receive a notification once they accept your request.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
                                <p className="text-amber-800 text-sm">
                                    <strong>Note:</strong> After getting the acceptance notification, the deposit should be paid within 2 hours of the email being sent. You will be warned once; if missed again, the request will be canceled. Thank you for your understanding.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Photographer</span>
                                    <span className="font-medium">{photographerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Package</span>
                                    <span className="font-medium">{packages.find(p => p.id === formData.packageId)?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium">{formData.date?.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Estimated Total</span>
                                    <span className="font-bold text-green-700">${packages.find(p => p.id === formData.packageId)?.price}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate({ to: ROUTES.USER.HOME })}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Back to Home
                                </button>
                                <button
                                    onClick={() => navigate({ to: ROUTES.USER.DASHBOARD as any })}
                                    className="flex-1 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800"
                                >
                                    View Dashboard
                                </button>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>

                {formData.photographerId && (
                    <CheckAvailabilityModal
                        isOpen={isAvailabilityModalOpen}
                        onClose={() => setIsAvailabilityModalOpen(false)}
                        photographerId={formData.photographerId}
                        photographerName={photographerName}
                        onBook={(date) => {
                            setFormData({ ...formData, date });
                            setIsAvailabilityModalOpen(false);
                        }}
                    />
                )}

            </div>
        </div>
    )
}

function StepIndicator({ current, number, icon }: { current: number, number: number, icon: React.ReactNode }) {
    const isActive = current >= number;
    const isCurrent = current === number;

    return (
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
            ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}
            ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}
        `}>
            {isActive && !isCurrent && number < current ? <Check size={16} /> : icon}
        </div>
    );
}

export default BookingWizard;
