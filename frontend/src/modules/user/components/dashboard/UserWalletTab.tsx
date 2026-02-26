import { motion } from "framer-motion";
import { Wallet, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import type { WalletDetails, WalletTransaction } from "../../../../services/api/walletApi";

interface UserWalletTabProps {
    walletData: WalletDetails | undefined;
    transactions: WalletTransaction[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    filter: string;
    onFilterChange: (value: string) => void;
    onRefresh: () => void;
}

export const UserWalletTab = ({ walletData, transactions, isLoading, page, totalPages, onPageChange, filter, onFilterChange, onRefresh }: UserWalletTabProps) => {

    return (
        <motion.div key="wallet" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <div className="space-y-6">
                
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 opacity-90">
                            <Wallet size={20} />
                            <span className="font-medium">Available Balance</span>
                        </div>
                        <div className="text-4xl font-bold tracking-tight">${walletData?.balance?.toFixed(2) || '0.00'}</div>
                        {walletData?.pendingBalance !== undefined && walletData.pendingBalance > 0 && (
                            <div className="mt-2 text-sm bg-white/20 inline-block px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30">
                                <span className="opacity-90 font-medium">Pending Release: </span>
                                <span className="font-bold ml-1">${walletData.pendingBalance.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Transaction History</h3>
                            <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100 transition-colors" title="Refresh Transactions">
                                <RefreshCw size={16} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onFilterChange('ALL')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                            <button onClick={() => onFilterChange('CREDIT')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filter === 'CREDIT' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>Credits</button>
                            <button onClick={() => onFilterChange('DEBIT')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filter === 'DEBIT' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>Debits</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading wallet details...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions found</td></tr>
                                ) : (
                                    transactions.map((tx: WalletTransaction, idx: number) => {
                                        const isPending = tx.status === 'PENDING';
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors relative">
                                                <td className="w-1 p-0">
                                                    <div className={`h-full w-1 ${tx.type === 'CREDIT' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{tx.description}</span>
                                                        {tx.referenceId && <span className="text-[10px] text-gray-400 font-normal mt-0.5">Ref: {tx.referenceId}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.75 rounded text-[10px] font-bold uppercase ${isPending ? 'bg-orange-100 text-orange-800' : (tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}`}>
                                                        {isPending ? 'PENDING' : tx.type}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {tx.type === 'CREDIT' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-xs font-medium ${isPending ? 'text-orange-600' : 'text-gray-500'}`}>{tx.status}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center p-4 border-t border-gray-100 gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-4 py-2 bg-white border rounded-lg flex items-center text-gray-600 font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
