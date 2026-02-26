import { useState } from "react";
import { Modal } from "./Modal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, AlertCircle, CheckCircle, Copy, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getErrorMessage } from "../../utils/errorhandler";

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_KEY) {
    console.error("❌ VITE_STRIPE_PUBLISHABLE_KEY is missing in environment variables!");
}

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientSecret: string;
    amount: number;
    onSuccess: (paymentIntentId: string) => Promise<void>;
    itemName?: string;
}

const CheckoutForm = ({ amount, onSuccess, itemName, onClose }: { amount: number, onSuccess: (id: string) => Promise<void>, itemName?: string, onClose: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const [showTestCards, setShowTestCards] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setStatus('processing');
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || "An unexpected error occurred.");
                setIsLoading(false);
                setStatus('idle');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setStatus('success');

                setTimeout(async () => {
                    await onSuccess(paymentIntent.id);
                    onClose();
                }, 2000);
            } else {
                setErrorMessage("Payment status is incomplete.");
                setIsLoading(false);
                setStatus('idle');
            }
        } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error) || "Payment failed.");
            setIsLoading(false);
            setStatus('idle');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-10 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-500">Thank you for your secure payment.</p>
            </motion.div>
        );
    }

    return (
        <div className="relative overflow-hidden">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Amount</span>
                        <span className="text-2xl font-bold text-[#2E7D46]">${amount.toFixed(2)}</span>
                    </div>
                    {itemName && (
                        <div className="text-sm text-gray-600 border-t border-gray-200 pt-2 mt-2">
                            <span className="font-semibold">Item:</span> {itemName}
                        </div>
                    )}
                </div>

                <PaymentElement />

                <div className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowTestCards(!showTestCards)}
                        className="w-full px-4 py-2 flex justify-between items-center text-xs font-bold text-blue-700 bg-blue-100/50 hover:bg-blue-100 transition-colors"
                    >
                        <span className="flex items-center gap-2"><CreditCard size={14} /> USE TRIAL BANK ACCOUNT (TEST CARD)</span>
                        <span>{showTestCards ? 'Hide' : 'Show'}</span>
                    </button>
                    <AnimatePresence>
                        {showTestCards && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="bg-white p-3 text-xs space-y-2"
                            >
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                                    <div>
                                        <div className="font-mono font-bold text-gray-700">4242 4242 4242 4242</div>
                                        <div className="text-gray-400 text-[10px]">Visa • Any Date • Any CVC</div>
                                    </div>
                                    <button type="button" onClick={() => copyToClipboard('4242424242424242')} className="text-blue-600 hover:text-blue-800 p-1"><Copy size={14} /></button>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                                    <div>
                                        <div className="font-mono font-bold text-gray-700">5555 5555 5555 4444</div>
                                        <div className="text-gray-400 text-[10px]">Mastercard • Any Date • Any CVC</div>
                                    </div>
                                    <button type="button" onClick={() => copyToClipboard('5555555555554444')} className="text-blue-600 hover:text-blue-800 p-1"><Copy size={14} /></button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {errorMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={!stripe || isLoading}
                    className="w-full bg-[#2E7D46] text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-green-900/20 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Processing Securely...
                        </>
                    ) : (
                        `Pay $${amount.toFixed(2)}`
                    )}
                </button>
                <div className="flex justify-center items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                    Encrypted & Secure Payment
                </div>
            </form>
        </div>
    );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, clientSecret, amount, onSuccess, itemName }) => {
    if (!isOpen) return null;

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#2E7D46',
                borderRadius: '12px',
                fontFamily: '"DM Sans", sans-serif',
            }
        },
    };

    if (!stripePromise) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Payment Error">
                <div className="p-6 flex flex-col items-center text-center text-red-600 gap-3">
                    <AlertCircle size={48} />
                    <h3 className="font-bold text-lg">Configuration Error</h3>
                    <p>Stripe is not configured correctly.</p>
                    <p className="text-xs bg-red-50 p-2 rounded">Missing VITE_STRIPE_PUBLISHABLE_KEY</p>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 text-sm font-bold mt-2">Close</button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Secure Checkout">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {clientSecret ? (
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm amount={amount} onSuccess={onSuccess} itemName={itemName} onClose={onClose} />
                    </Elements>
                ) : (
                    <div className="flex flex-col justify-center items-center p-12 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#2E7D46]" />
                        <p className="text-gray-500 font-medium animate-pulse">Initializing Secure Gateway...</p>
                    </div>
                )}
            </motion.div>
        </Modal>
    );
};
