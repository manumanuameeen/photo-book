import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Upload, DollarSign, Package } from 'lucide-react';
import { useForm, FormProvider, type SubmitHandler, type FieldValues, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { rentalApi } from '../../../services/api/rentalApi';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { StepDetails } from '../components/rental_wizard/StepDetails';
import { StepPhotos } from '../components/rental_wizard/StepPhotos';
import { StepPricing } from '../components/rental_wizard/StepPricing';
import { StepReview } from '../components/rental_wizard/StepReview';

const rentItemSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    category: z.string().min(1, "Category is required"),
    condition: z.string().min(1, "Condition is required"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    pickupLocation: z.string().min(5, "Pickup location is required"),
    pricePerDay: z.coerce.number().min(1, "Price must be greater than 0"),
    securityDeposit: z.coerce.number().min(0, "Deposit cannot be negative"),
    minRentalPeriod: z.coerce.number().default(1),
    maxRentalPeriod: z.coerce.number().min(1, "Max rental period must be at least 1 day"),
    stock: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
});

type RentItemFormData = z.infer<typeof rentItemSchema>;

const steps = [
    { id: 1, title: 'Details', icon: Package },
    { id: 2, title: 'Photos', icon: Upload },
    { id: 3, title: 'Pricing', icon: DollarSign },
    { id: 4, title: 'Review', icon: Check },
];

export default function RentItemWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const methods = useForm<RentItemFormData>({

        resolver: zodResolver(rentItemSchema) as Resolver<RentItemFormData>,
        mode: 'onChange',
        defaultValues: {
            condition: 'Good',
            pricePerDay: 50,
            securityDeposit: 0,
            minRentalPeriod: 1,
            maxRentalPeriod: 5,
            stock: 1
        }
    });

    const { handleSubmit, trigger, formState: { errors } } = methods;

    const nextStep = async () => {

        let fieldsToValidate: (keyof RentItemFormData)[] = [];
        if (currentStep === 1) fieldsToValidate = ['name', 'category', 'condition', 'description', 'pickupLocation'];

        if (currentStep === 2) {
            if (selectedFiles.length < 4) {
                toast.error("You must upload at least 4 photos!");
                return;
            }
        }

        if (currentStep === 3) fieldsToValidate = ['pricePerDay', 'securityDeposit', 'maxRentalPeriod', 'stock'];

        const isStepValid = await trigger(fieldsToValidate);

        if (!isStepValid) {
            console.log("Validation Failed:", errors);
            toast.error("Please fix the errors before proceeding.");
        }

        if (isStepValid || currentStep === 2) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        const data = values as RentItemFormData;
        if (currentStep !== steps.length) {
            nextStep();
            return;
        }

        if (selectedFiles.length < 4) {
            toast.error("Verification Failed: At least 4 images required.");
            setCurrentStep(2);
            return;
        }

        try {
            setIsSubmitting(true);
            await rentalApi.createItem({
                ...data,
                images: selectedFiles
            });

            toast.success("Listing submitted successfully!");
            navigate({ to: ROUTES.USER.PROFILE });
        } catch (error) {
            toast.error("Failed to create listing. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 -z-10 rounded-full" />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#1E5631] transition-all duration-500 ease-in-out -z-10 rounded-full"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center relative">
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 bg-white
                                        ${isActive ? 'border-[#1E5631] text-[#1E5631] shadow-lg scale-110' :
                                            isCompleted ? 'border-[#1E5631] bg-[#1E5631] text-white' : 'border-gray-200 text-gray-300'
                                        }
                                    `}>
                                        {isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={20} />}
                                    </div>
                                    <span className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-[#1E5631]' : isCompleted ? 'text-[#1E5631]' : 'text-gray-400'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-10">
                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={checkKeyDown}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {(() => {
                                            switch (currentStep) {
                                                case 1:
                                                    return <StepDetails />;
                                                case 2:
                                                    return (
                                                        <StepPhotos
                                                            selectedFiles={selectedFiles}
                                                            setSelectedFiles={setSelectedFiles}
                                                            previewUrls={previewUrls}
                                                            setPreviewUrls={setPreviewUrls}
                                                        />
                                                    );
                                                case 3:
                                                    return <StepPricing />;
                                                case 4:
                                                    return <StepReview previewImage={previewUrls[0]} />;
                                                default:
                                                    return null;
                                            }
                                        })()}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                        className={`
                                            flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                                            ${currentStep === 1
                                                ? 'text-gray-300 cursor-not-allowed opacity-50'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        <ChevronLeft size={20} /> Back
                                    </button>

                                    {currentStep < steps.length ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex items-center gap-2 px-8 py-3 bg-[#1E5631] text-white rounded-xl font-bold hover:bg-[#164024] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            Next Step <ChevronRight size={20} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                                            {!isSubmitting && <Check size={20} strokeWidth={3} />}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}
