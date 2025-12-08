import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../../constants/routes';
import { useApplicationStore } from '../../store/useApplicationStore';

const SuccessStep = () => {
    const navigate = useNavigate();
    const { resetForm } = useApplicationStore();

    const handleNavigateHome = () => {
        resetForm();
        navigate({ to: ROUTES.USER.HOME });
    };

    const handleNavigateProfile = () => {
        resetForm();
        navigate({ to: ROUTES.USER.PROFILE });
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <CheckCircle className="w-24 h-24 text-green-500 mb-6" strokeWidth={1.5} />
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-green-700 mb-4"
            >
                Application Submitted Successfully!
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-8 max-w-md text-lg"
            >
                Thank you for applying to join our network of professional photographers. Your application is now under review.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500 w-full max-w-md mb-10 shadow-sm"
            >
                <p className="font-semibold text-green-800 text-lg mb-2">What Happens Next?</p>
                <ul className="text-sm text-green-700 space-y-2 text-left">
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Our team will review your application within 3-5 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>You'll receive an email notification regarding your application status</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Check your profile for application status updates</span>
                    </li>
                </ul>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
            >
                <button
                    onClick={handleNavigateHome}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <Home size={20} />
                    Go to Home
                </button>
                <button
                    onClick={handleNavigateProfile}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <User size={20} />
                    View Profile
                </button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-500 text-sm mt-8"
            >
                Application ID: #{Date.now().toString().slice(-8)}
            </motion.p>
        </div>
    );
};

export default SuccessStep;