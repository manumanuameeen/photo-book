import React from 'react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isConfirming?: boolean;
    variant?: 'danger' | 'primary' | 'success' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isConfirming = false,
    variant = 'primary'
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-200';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-200';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-200';
            default:
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} width="max-w-sm">
            <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isConfirming}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className={`px-4 py-2 text-white font-medium rounded-lg transition-all shadow-sm focus:ring-4 text-sm flex items-center gap-2 ${getVariantClasses()} ${isConfirming ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isConfirming && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
