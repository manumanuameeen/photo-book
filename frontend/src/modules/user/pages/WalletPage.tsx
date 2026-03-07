import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { StripeWrapper } from "../../../components/payment/StripeWrapper";
import { toast } from "sonner";
import { walletApi, type WalletTransaction } from "../../../services/api/walletApi";

export function WalletPage() {
    const { user } = useAuthStore();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState(100);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingTxs, setIsLoadingTxs] = useState(false);

    const fetchWalletDetails = useCallback(async () => {
        try {
            const data = await walletApi.getWalletDetails();
            setBalance(data.balance || 0);
        } catch (error) {
            console.error("Failed to fetch wallet details", error);
            toast.error("Failed to load wallet details");
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setIsLoadingTxs(true);
        try {
            const data = await walletApi.getWalletTransactions(page, 5, 'ALL');
            setTransactions(data.transactions || []);
            setTotalPages(Math.ceil((data.total || 0) / 5) || 1);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast.error("Failed to load transactions");
        } finally {
            setIsLoadingTxs(false);
        }
    }, [page]);

    useEffect(() => {
        fetchWalletDetails();
    }, [fetchWalletDetails]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wallet className="w-8 h-8 text-green-600" /> My Wallet
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-green-100 text-sm font-medium mb-1">Total Balance</div>
                    <div className="text-4xl font-bold mb-6">${balance.toFixed(2)}</div>
                    <button
                        onClick={() => setShowAddFunds(true)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg backdrop-blur-sm"
                    >
                        <Plus size={18} /> Add Funds
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px] flex flex-col relative">
                    <div className="text-gray-500 text-sm font-medium mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
                        <History size={16} /> Recent Activity
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                        {isLoadingTxs ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Loading transactions...</div>
                        ) : transactions && transactions.length > 0 ? (
                            transactions.map((tx, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${tx.type === 'CREDIT' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className={`p-2 rounded-full flex-shrink-0 ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {tx.type === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 truncate pr-2">{tx.description}</div>
                                            <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-bold whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No recent transactions found</div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-xs font-medium text-gray-500">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showAddFunds && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowAddFunds(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">Add Funds to Wallet</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input
                                type="number"
                                value={amountToAdd}
                                onChange={(e) => setAmountToAdd(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                min="1"
                            />
                        </div>

                        <StripeWrapper
                            amount={amountToAdd}
                            userId={user?._id || ""}
                            onSuccess={() => {
                                toast.success("Wallet credited successfully!");
                                setShowAddFunds(false);
                                fetchWalletDetails();
                                fetchTransactions();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
