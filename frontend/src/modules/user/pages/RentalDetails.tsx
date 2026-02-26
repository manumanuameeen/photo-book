import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReviewForm from '../../shared/components/reviews/ReviewForm';
import ReviewList from '../../shared/components/reviews/ReviewList';
import ReviewStatsSummary from '../../shared/components/reviews/ReviewStatsSummary';
import LikeButton from '../../shared/components/interactions/LikeButton';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { rentalApi } from '../../../services/api/rentalApi';
import { PaymentModal } from '../../../components/common/PaymentModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { MapPin, Shield, Package, ChevronLeft, AlertCircle, MessageCircle, X, Send, Award, Star } from 'lucide-react';
import { ReportModal } from '../../../components/common/ReportModal';
import { messageApi } from '../../../services/api/messageApi';
import { toast } from 'sonner';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { ROUTES } from '../../../constants/routes';
import { AvailabilityCalendar } from '../../../components/common/AvailabilityCalendar';
import { format } from 'date-fns';
import type { IRentalOrder } from '../../../types/rental';

export default function RentalDetails() {
    const { id } = useParams({ strict: false }) as { id: string };
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [pendingOrder, setPendingOrder] = useState<{ clientSecret: string, order: IRentalOrder } | null>(null);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isOrderSavedModalOpen, setIsOrderSavedModalOpen] = useState(false);

    const paymentMethod = 'ONLINE';
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const search: { orderId?: string, action?: string } = useSearch({ strict: false });
    const [existingOrder, setExistingOrder] = useState<IRentalOrder | null>(null);

    const { data: itemData, isLoading } = useQuery({
        queryKey: ['rental-item', id],
        queryFn: () => rentalApi.getItemDetails(id!),
        enabled: !!id
    });

    const { data: unavailableDates = [] } = useQuery({
        queryKey: ['rental-unavailable', id],
        queryFn: () => rentalApi.getUnavailableDates(id!),
        enabled: !!id
    });

    const confirmMutation = useMutation({
        mutationFn: (data: { orderId: string, paymentIntentId: string }) =>
            rentalApi.confirmRentalRequest(data.orderId, data.paymentIntentId),
        onSuccess: () => {
            setShowSuccess(true);
            setTimeout(() => {

                navigate({ to: ROUTES.USER.DASHBOARD, search: { tab: 'rentals' } });
            }, 3000);
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            console.error("Confirmation Error:", error);
            toast.error(apiError.response?.data?.message || "Payment succeeded but order confirmation failed. Please contact support.");
        }
    });

    const rentMutation = useMutation({
        mutationFn: () => rentalApi.rentItem({
            itemIds: [id!],
            startDate: startDate!,
            endDate: endDate!,
            paymentIntentId: undefined,
            paymentMethod
        }),
        onSuccess: (response) => {
            const data = response.data as unknown as { order: IRentalOrder; clientSecret?: string };
            const { clientSecret } = data;
            if (paymentMethod === 'ONLINE') {
                if (clientSecret) {

                    globalThis.window.location.href = clientSecret;
                } else {
                    toast.error("Failed to retrieve payment URL.");
                }
            } else {
                toast.success("Rental request submitted successfully!");
                navigate({ to: ROUTES.USER.HOME });
            }
        },
        onError: (error: unknown) => {
            console.error("Rental Request Failed:", error);
            const apiError = error as { response?: { data?: { message?: string, stack?: string } } };
            const errorMessage = apiError.response?.data?.message || "Failed to submit rental request";

            if (!apiError.response?.data?.message) {
                console.error("No error message from backend:", apiError);
            }

            toast.error(errorMessage);
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: (data: { receiverId: string, content: string }) => messageApi.sendMessage(data.receiverId, data.content),
        onSuccess: () => {
            toast.success("Message sent to owner!");
            setIsMessageModalOpen(false);
            setMessageContent("");
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || "Failed to send message");
        }
    });

    const { data: orderDetailsData } = useQuery({
        queryKey: ['admin-rental-order', search.orderId],
        queryFn: () => rentalApi.getOrderDetails(search.orderId!),
        enabled: !!search.orderId && search.action === 'pay'
    });

    useEffect(() => {
        if (orderDetailsData?.data && search.action === 'pay') {
            const order = orderDetailsData.data as IRentalOrder;
            setExistingOrder(order);
            setPendingOrder({
                clientSecret: order.paymentSecret || '',
                order: order
            });
        }
    }, [orderDetailsData, search.action]);

    const item = itemData?.data;
    const isOwner = !!(user?._id && item?.ownerId &&
        String(typeof item.ownerId === 'object' ? (item.ownerId as { _id: string })._id : item.ownerId) === String(user._id));

    if (item && !selectedImage && item.images && item.images.length > 0) {
        setSelectedImage(item.images[0]);
    }

    const calculateTotal = () => {
        if (!startDate || !endDate || !item) return null;
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (days < (item.minRentalPeriod || 1)) return null;
        if (item.maxRentalPeriod && days > item.maxRentalPeriod) return null;

        const rentalCost = days * item.pricePerDay;
        const tax = 0;
        const grandTotal = rentalCost;

        return {
            days,
            rentalCost,
            tax,
            grandTotal
        };
    };

    const totals = calculateTotal();

    const handleRentClick = () => {
        if (!user) {
            toast.error("Please login to rent items");
            navigate({ to: ROUTES.AUTH.LOGIN });
            return;
        }
        if (!startDate || !endDate) {
            toast.error("Please select rental dates");
            return;
        }

        if (!totals) {
            toast.error(`Minimum rental period is ${item?.minRentalPeriod || 1} days`);
            return;
        }

        if (item?.maxRentalPeriod && totals.days > item.maxRentalPeriod) {
            toast.error(`Maximum rental period is ${item.maxRentalPeriod} days`);
            return;
        }

        setShowPayment(true);
    };

    const handleConfirmRental = () => {
        rentMutation.mutate();
    };

    const handleDateSelect = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
        setShowPayment(false);
        setPendingOrder(null);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
    if (!item) return <div className="min-h-screen flex items-center justify-center">Item not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans pb-20">
            
            {pendingOrder && (
                <PaymentModal
                    isOpen={!!pendingOrder}
                    onClose={() => {
                        if (!showSuccess) {
                            setIsOrderSavedModalOpen(true);
                        }
                        setPendingOrder(null);
                    }}
                    clientSecret={pendingOrder.clientSecret}
                    amount={existingOrder ? (existingOrder.depositeRequired || Math.round(existingOrder.totalAmount * 0.25)) : Math.round((pendingOrder.order?.totalAmount || totals!.grandTotal) * 0.25)}
                    itemName={`Rental: ${item.name}`}
                    onSuccess={async (paymentIntentId) => {
                        await confirmMutation.mutateAsync({ orderId: pendingOrder.order._id, paymentIntentId });
                    }}
                />
            )}

            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate({ to: ROUTES.USER.RENTAL_MARKETPLACE })} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors">
                    <ChevronLeft size={20} /> Back to Marketplace
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-8">
                        
                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                            <button
                                type="button"
                                className="w-full aspect-video bg-gray-50 rounded-xl overflow-hidden relative cursor-zoom-in group text-left p-0 border-0"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">View Fullscreen</span>
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedImage || item.images?.[0]}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full"
                                    >
                                        {selectedImage || item.images?.[0] ? (
                                            <img
                                                src={selectedImage || item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-contain bg-black/5"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={64} /></div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                            {item.images?.length > 1 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {item.images.map((img: string) => (
                                        <motion.div
                                            key={img}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedImage(img)}
                                            className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === img ? 'border-green-600 ring-2 ring-green-100 shadow-lg' : 'border-transparent hover:border-green-300'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
                                <LikeButton
                                    targetId={id!}
                                    targetType="rental"
                                    initialLikes={item.likes || []}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <ReviewStatsSummary targetId={id!} />
                                <span className="flex items-center gap-1"><MapPin size={16} /> {item.pickupLocation}</span>
                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{item.condition} Condition</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{item.category}</span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">{item.description}</p>

                            {!isOwner && (
                                <div className="flex flex-col items-start gap-1">
                                    <button
                                        onClick={() => {
                                            const ownerId = typeof item.ownerId === 'object' && item.ownerId !== null
                                                ? (item.ownerId as { _id: string })._id
                                                : item.ownerId as string;
                                            navigate({ to: '/chat', search: { userId: ownerId } });
                                        }}
                                        className="flex items-center gap-2 text-green-700 font-bold hover:underline"
                                    >
                                        <MessageCircle size={18} /> Chat with Owner
                                    </button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="flex items-center gap-2 text-red-500 font-medium hover:text-red-700 hover:underline mt-3 text-sm"
                                    >
                                        <Award size={16} className="rotate-180" /> Report Item
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Availability</h3>
                            <div className="max-w-md">
                                <AvailabilityCalendar
                                    unavailableDates={unavailableDates}
                                    onDateSelect={handleDateSelect}
                                    range={{ startDate, endDate }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-gray-100">
                                <span className="text-4xl font-bold text-[#1E5631]">${item.pricePerDay}</span>
                                <span className="text-gray-500 font-medium mb-1">/ day</span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 block mb-1.5">Rental Period</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                                        {startDate && endDate ? (
                                            <div className="flex justify-between items-center text-gray-800 font-medium">
                                                <span>{format(startDate, 'MMM dd')}</span>
                                                <span className="text-gray-400">→</span>
                                                <span>{format(endDate, 'MMM dd, yyyy')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Select dates from calendar</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {totals && (
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>${item.pricePerDay} x {totals.days} days</span>
                                        <span>${totals.rentalCost.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>${totals.grandTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <div className="flex justify-between font-bold text-green-800 text-lg mb-1">
                                            <span>Pay Now (25%)</span>
                                            <span>${(totals.grandTotal * 0.25).toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-green-600">Remaining amount will be paid later.</p>
                                    </div>

                                    {item.minRentalPeriod && totals.days < item.minRentalPeriod && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Minimum rental period is {item.minRentalPeriod} days
                                        </div>
                                    )}
                                    {item.maxRentalPeriod && totals.days > item.maxRentalPeriod && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Maximum rental period is {item.maxRentalPeriod} days
                                        </div>
                                    )}
                                </div>
                            )}

                            {!showPayment ? (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="block text-sm font-bold text-gray-700 mb-2">Payment Method</h4>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 p-3 border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border-green-600 bg-green-50 text-green-700 font-bold`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="ONLINE"
                                                    checked={true}
                                                    readOnly
                                                    className="hidden"
                                                />
                                                Pay Online
                                            </label>
                                        </div>
                                    </div>

                                    {isOwner ? (
                                        <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-center border border-gray-200">
                                            This is your item
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleRentClick}
                                            disabled={!totals || (!!item.minRentalPeriod && totals.days < item.minRentalPeriod) || (!!item.maxRentalPeriod && totals.days > item.maxRentalPeriod)}
                                            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg transform active:scale-[0.98] ${totals &&
                                                (!item.minRentalPeriod || totals.days >= item.minRentalPeriod) &&
                                                (!item.maxRentalPeriod || totals.days <= item.maxRentalPeriod)
                                                ? 'bg-[#1E5631] text-white hover:bg-[#164024] hover:shadow-green-900/20'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Proceed to Book
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800">
                                            {showSuccess ? 'Payment Successful' : (paymentMethod === 'ONLINE' ? 'Secure Payment' : 'Confirm Booking')}
                                        </h3>
                                        {!showSuccess && <button onClick={() => { setShowPayment(false); setPendingOrder(null); }} className="text-xs text-gray-500 hover:text-red-500">Cancel</button>}
                                    </div>

                                    {showSuccess ? (
                                        <div className="text-center py-8 bg-green-50 rounded-lg animate-in fade-in zoom-in">
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Shield size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-green-800 mb-2">Payment Confirmed!</h3>
                                            <p className="text-sm text-green-600 mb-4">Your rental request has been submitted.</p>
                                            <p className="text-xs text-gray-400">Redirecting to dashboard...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">You will be redirected to secure payment.</p>
                                            <button
                                                onClick={() => handleConfirmRental()}
                                                disabled={rentMutation.isPending}
                                                className="w-full py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors"
                                            >
                                                {rentMutation.isPending ? 'Processing...' : 'Proceed to Pay'}
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <Shield size={12} />
                                        <span>Payments secured by Stripe</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isMessageModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <MessageCircle className="text-green-600" size={20} />
                                    Contact Owner
                                </h3>
                                <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Hi, is this item still available?"
                                    className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none mb-4"
                                />
                                <button
                                    onClick={() => {
                                        if (!messageContent.trim()) return toast.error("Please enter a message");
                                        const ownerId = typeof item.ownerId === 'object' && item.ownerId !== null
                                            ? (item.ownerId as { _id: string })._id
                                            : item.ownerId as string;
                                        sendMessageMutation.mutate({ receiverId: ownerId, content: messageContent });
                                    }}
                                    disabled={sendMessageMutation.isPending}
                                    className="w-full py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    {sendMessageMutation.isPending ? "Sending..." : <><Send size={16} /> Send Message</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                        {user?._id && (
                            <button
                                onClick={() => navigate({ to: ROUTES.USER.DASHBOARD, search: { tab: 'reviews' } })}
                                className="text-xs font-bold text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg border border-green-100 transition-all flex items-center gap-1.5"
                            >
                                <Star size={14} className="fill-green-700" />
                                Manage My Reviews
                            </button>
                        )}
                    </div>

                    {!isOwner && (
                        <div className="mb-8">
                            <ReviewForm
                                targetId={id!}
                                type="rental"
                            />
                        </div>
                    )}

                    <ReviewList targetId={id!} isOwner={isOwner} />
                </div>

                <ConfirmationModal
                    isOpen={isOrderSavedModalOpen}
                    onClose={() => setIsOrderSavedModalOpen(false)}
                    onConfirm={() => navigate({ to: ROUTES.USER.HOME })}
                    title="Order Saved"
                    message="Your rental order has been created and saved! You can complete the deposit payment later from your Dashboard under 'My Rentals'."
                    confirmText="Go to Dashboard"
                    cancelText="Stay Here"
                />

                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    targetId={id!}
                    targetType="rental"
                    targetName={item.name}
                />

                <AnimatePresence>
                    {isLightboxOpen && (
                        <motion.div
                            key="lightbox-modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <button
                                className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
                                onClick={() => setIsLightboxOpen(false)}
                            >
                                <X size={32} />
                            </button>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={selectedImage || item.images?.[0]}
                                    alt={item.name}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                />

                                {item.images?.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {item.images.map((img: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedImage(img)}
                                                className={`w-3 h-3 rounded-full transition-all ${selectedImage === img ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
