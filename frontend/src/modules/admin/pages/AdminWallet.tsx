import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { walletApi, type WalletDetails, type EscrowBooking, type EscrowRental, type WalletTransaction } from '../../../services/api/walletApi';
import { Wallet, ArrowUpRight, Loader2, DollarSign, Search, Lock, User, Camera, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AdminWallet = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'transactions' | 'escrow'>('transactions');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const limit = 8;

    const { data: wallet, isLoading: walletLoading } = useQuery<WalletDetails>({
        queryKey: ['admin-wallet'],
        queryFn: walletApi.getWalletDetails,
    });

    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: walletApi.getDashboardStats,
    });

    const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
        queryKey: ['admin-wallet-transactions', page, typeFilter],
        queryFn: () => {
            const isStatus = ['PENDING'].includes(typeFilter);
            return walletApi.getWalletTransactions(
                page,
                limit,
                isStatus || typeFilter === 'ALL' ? '' : typeFilter,
                isStatus ? typeFilter : undefined
            );
        },
        enabled: activeTab === 'transactions',
        placeholderData: keepPreviousData,
    });

    const { data: escrowStats, isLoading: escrowLoading } = useQuery<{ bookings: EscrowBooking[], rentals: EscrowRental[], totalBookings: number, totalRentals: number }>({
        queryKey: ['admin-escrow-stats', page, searchTerm],
        queryFn: () => walletApi.getEscrowStats(page, limit, searchTerm),
        placeholderData: keepPreviousData,
        enabled: activeTab === 'escrow',
    });

    const handleNextPage = () => setPage(p => p + 1);
    const handlePrevPage = () => setPage(p => Math.max(1, p - 1));

    if (walletLoading || statsLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
        );
    }

    if (!wallet) {
        return <div>Failed to load wallet</div>;
    }

    const transactions = transactionsData?.transactions || [];
    const totalTransactions = transactionsData?.total || 0;

    interface NormalizedEscrowItem {
        _id: string;
        type: 'Booking' | 'Rental';
        amount: number;
        createdAt: string;
        status: string;
        paymentStatus: string;
        client: { name: string; email: string; profileImage?: string } | undefined;
        provider: { name: string; profileImage?: string; type: 'Photographer' | 'Item Owner' } | undefined;
        context: { name?: string; subtext?: string };
    }

    const escrowItems: NormalizedEscrowItem[] = [
        ...(escrowStats?.bookings || []).map((b: EscrowBooking) => ({
            _id: b._id,
            type: 'Booking' as const,
            amount: b.totalAmount || 0,
            createdAt: b.createdAt,
            status: b.status,
            paymentStatus: b.paymentStatus,
            client: b.userId ? { name: b.userId.name, email: b.userId.email, profileImage: b.userId.profileImage } : undefined,
            provider: b.photographerId ? { name: b.photographerId.name, profileImage: b.photographerId.profileImage, type: 'Photographer' as const } : undefined,
            context: { name: b.packageDetails?.name, subtext: b.eventType }
        })),
        ...(escrowStats?.rentals || []).map((r: EscrowRental) => ({
            _id: r._id,
            type: 'Rental' as const,
            amount: r.totalAmount || 0,
            createdAt: r.createdAt,
            status: r.status,
            paymentStatus: r.paymentStatus,
            client: r.renterId ? { name: r.renterId.name, email: r.renterId.email, profileImage: r.renterId.profileImage } : undefined,
            provider: r.items?.[0]?.ownerId ? { name: r.items[0].ownerId.name, profileImage: r.items[0].ownerId.profileImage, type: 'Item Owner' as const } : undefined,
            context: { name: 'Equipment Rental', subtext: `${r.items?.length || 0} item(s)` }
        }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalEscrowItems = (escrowStats?.totalBookings || 0) + (escrowStats?.totalRentals || 0);
    const totalPages = activeTab === 'transactions'
        ? Math.ceil(totalTransactions / limit)
        : Math.ceil(totalEscrowItems / limit);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Wallet & Escrow</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Volume</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">${dashboardStats?.volume?.toFixed(2) || '0.00'}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-green-50 text-green-600">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Revenue</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">${dashboardStats?.revenue?.toFixed(2) || '0.00'}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-amber-50 text-amber-600">
                            <Lock size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Escrow</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">${dashboardStats?.escrow?.toFixed(2) || '0.00'}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-purple-50 text-purple-600">
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Payouts</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">${dashboardStats?.payouts?.toFixed(2) || '0.00'}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Pending</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">${wallet.pendingBalance?.toFixed(2) || '0.00'}</div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <DollarSign size={16} />
                        <span className="text-sm font-medium">Available Balance</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-6">
                        ${wallet.balance.toFixed(2)}
                    </h1>

                    <div className="flex gap-4">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl backdrop-blur-sm transition-all text-sm font-medium flex items-center gap-2">
                            <ArrowUpRight size={16} />
                            Withdraw Funds
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200 flex gap-6">
                <button
                    onClick={() => { setActiveTab('transactions'); setPage(1); }}
                    className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'transactions' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Transaction History
                </button>
                <button
                    onClick={() => { setActiveTab('escrow'); setPage(1); }}
                    className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'escrow' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Escrow Holdings ({totalEscrowItems})
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div className="relative w-full md:w-96">
                    {activeTab === 'escrow' ? (
                        <>
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search clients, photographers..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            />
                        </>
                    ) : (
                        <div className="text-sm text-gray-500 italic flex items-center gap-2">
                            <Clock size={16} />
                            Viewing all {typeFilter === 'ALL' ? '' : typeFilter.toLowerCase()} transactions
                        </div>
                    )}
                </div>
                {activeTab === 'transactions' && (
                    <div className="flex gap-2">
                        {['ALL', 'CREDIT', 'DEBIT', 'PENDING'].map(type => (
                            <button
                                key={type}
                                onClick={() => { setTypeFilter(type); setPage(1); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${typeFilter === type ? (type === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-green-600 text-white') : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {activeTab === 'transactions' && (
                    <div className="divide-y divide-gray-50">
                        {transactionsLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="animate-spin text-green-600" size={24} />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">No transactions found matching your criteria.</div>
                        ) : (
                            transactions.map((transaction: WalletTransaction, index: number) => (
                                <div key={transaction.referenceId || `tx-${index}`} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {transaction.type === 'CREDIT' ? <DollarSign size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{transaction.description}</p>
                                            <p className="text-xs text-gray-400">{format(new Date(transaction.date), 'PPP p')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-gray-800'}`}>
                                            {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                        </p>
                                        <p className={`text-xs font-bold uppercase ${transaction.status === 'COMPLETED' ? 'text-green-500' : 'text-orange-500'}`}>
                                            {transaction.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'escrow' && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Context & Details</th>
                                        <th className="px-6 py-4">Payer (Client)</th>
                                        <th className="px-6 py-4">Pending For (Provider)</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount Held</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {escrowLoading ? (
                                        <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin text-green-600 mx-auto" size={24} /></td></tr>
                                    ) : escrowItems.length === 0 ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-gray-400">No active funds in escrow for this page.</td></tr>
                                    ) : (
                                        escrowItems.map((item) => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 flex items-center gap-1">
                                                            {item.type === 'Booking' ? <Camera size={14} className="text-blue-500" /> : <Lock size={14} className="text-orange-500" />}
                                                            #{item._id.slice(-6).toUpperCase()}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
                                                        {item.context.name && (
                                                            <span className="mt-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded w-fit">
                                                                {item.context.name}
                                                            </span>
                                                        )}
                                                        {item.context.subtext && (
                                                            <span className="text-[10px] text-gray-400 italic">{item.context.subtext}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                            {item.client?.profileImage ? (
                                                                <img src={item.client.profileImage} alt="Client" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={14} className="text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col text-sm">
                                                            <span className="font-medium text-gray-800">{item.client?.name || 'Unknown'}</span>
                                                            <span className="text-[10px] text-gray-400">{item.client?.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                                            {item.provider?.profileImage ? (
                                                                <img src={item.provider.profileImage} alt="Provider" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Camera size={14} className="text-blue-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col text-sm">
                                                            <span className="font-medium text-gray-800">
                                                                {item.provider?.name || 'Unknown'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {item.provider?.type || 'Provider'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold uppercase ${['COMPLETED', 'completed'].includes(item.status) ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {item.status}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">
                                                            Payment: {item.paymentStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-gray-900 block">${(item.amount || 0).toFixed(2)}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (item.type === 'Booking') {
                                                                navigate({ to: `/photographer/bookings/${item._id}` });
                                                            } else if (item.type === 'Rental') {
                                                                navigate({ to: `/admin/rental-orders/${item._id}` });
                                                            }
                                                        }}
                                                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium mt-1"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
                        <span className="text-xs text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminWallet;
