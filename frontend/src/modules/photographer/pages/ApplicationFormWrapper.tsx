import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Clock, CheckCircle } from 'lucide-react';
import { useApplicationStore } from '../store/useApplicationStore';
import { MotionWrapper } from '../../../components/common/MotionWrapper';
import { AppCard } from '../../../components/common/AppCard';
import { ROUTES } from '../../../constants/routes';
import PersonalInfoStep from './steps/PersonalInfoSteps';
import ProfessionalDetailsStep from './steps/ProfessionalDetailsStep';
import PortfolioStep from './steps/PortfolioStep';
import BusinessBioStep from './steps/BusinessBioStep';
import ReviewStep from './steps/ReviewStep';
import SuccessStep from './steps/SuccessStep';

const applicationSteps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Professional Details' },
    { id: 3, title: 'Portfolio & Work' },
    { id: 4, title: 'Business Bio' },
    { id: 5, title: 'Review' },
];

const ApplicationFormWrapper = () => {
    const { currentStep, applicationStatus } = useApplicationStore();
    const navigate = useNavigate();

    const CurrentStepComponent = useMemo(() => {
        switch (currentStep) {
            case 1: return PersonalInfoStep;
            case 2: return ProfessionalDetailsStep;
            case 3: return PortfolioStep;
            case 4: return BusinessBioStep;
            case 5: return ReviewStep;
            case 6: return SuccessStep;
            default: return PersonalInfoStep;
        }
    }, [currentStep]);

    const StepIndicator: React.FC<{ step: number; title: string; index: number }> = ({
        step,
        title,
        index
    }) => {
        const isActive = step === currentStep;
        const isComplete = step < currentStep;

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
            >
                <motion.div
                    animate={{
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive ? '0 8px 16px rgba(22, 163, 74, 0.3)' : '0 0 0 rgba(0,0,0,0)'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${isActive
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                        : isComplete
                            ? 'bg-emerald-800'
                            : 'bg-gray-400'
                        }`}
                >
                    {isComplete ? (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            ✓
                        </motion.div>
                    ) : (
                        step
                    )}
                </motion.div>
                <p
                    className={`text-xs mt-2 text-center transition-all duration-300 ${isActive
                        ? 'text-green-700 font-semibold'
                        : 'text-gray-600'
                        }`}
                >
                    {title}
                </p>
            </motion.div>
        );
    };


    const showSteps = currentStep !== 6;



    if (applicationStatus === 'pending' && currentStep !== 6) {
        return (
            <MotionWrapper>
                <div className="max-w-2xl mx-auto py-20 px-4">
                    <AppCard className="p-10 text-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock size={40} className="text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Under Review</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Thank you for applying! Your photographer application is currently being reviewed by our team. We'll update you soon.
                        </p>
                        <button
                            onClick={() => navigate({ to: ROUTES.USER.PROFILE })}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-lg font-medium"
                        >
                            Back to Profile
                        </button>
                    </AppCard>
                </div>
            </MotionWrapper>
        );
    }


    if (applicationStatus === 'approved') {
        return (
            <MotionWrapper>
                <div className="max-w-2xl mx-auto py-20 px-4">
                    <AppCard className="p-10 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to the Team!</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Congratulations! Your application has been approved. You are now a registered photographer.
                        </p>
                        <button
                            onClick={() => navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD })}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg font-medium"
                        >
                            Go to Dashboard
                        </button>
                    </AppCard>
                </div>
            </MotionWrapper>
        );
    }

    return (
        <MotionWrapper>
            <div className="max-w-5xl mx-auto py-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl font-bold text-emerald-900 mb-3">
                        Become a Photographer
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Join our community of professional photographers
                    </p>
                </motion.div>

                <AppCard className="p-8 md:p-10">
                    {showSteps && (
                        <div className="mb-12">
                            <div className="flex justify-between items-center relative">
                                {applicationSteps.map((step, index) => (
                                    <React.Fragment key={step.id}>
                                        <StepIndicator
                                            step={step.id}
                                            title={step.title}
                                            index={index}
                                        />
                                        {index < applicationSteps.length - 1 && (
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{
                                                    scaleX: step.id < currentStep ? 1 : 0
                                                }}
                                                transition={{ duration: 0.5 }}
                                                className="flex-1 h-1 mx-3 bg-emerald-800 origin-left"
                                                style={{
                                                    backgroundColor: step.id < currentStep ? '#065f46' : '#d1d5db'
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CurrentStepComponent />
                        </motion.div>
                    </AnimatePresence>
                </AppCard>
            </div>
        </MotionWrapper>
    );
};

export default ApplicationFormWrapper;