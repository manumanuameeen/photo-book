import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    message?: string;
    isSubmitting?: boolean;
    cancelText?: string;
    confirmText?: string;
    note?: string;
}

export const CancelOrderModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Cancel Order",
    message = "Are you sure you want to cancel this order? Please provide a reason.",
    isSubmitting = false,
    cancelText = "Keep Order",
    confirmText = "Confirm Cancellation",
    note = "Cancellation fees may apply depending on how close the rental date is. Refunds will be processed to your original payment method."
}: CancelOrderModalProps) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Please provide a reason for cancellation');
            return;
        }
        onConfirm(reason);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">{message}</p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cancellation Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (e.target.value.trim()) setError('');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] resize-none"
                                placeholder="I changed my plans..."
                            />
                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> {note}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
