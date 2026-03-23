import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Clock, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import type { BookingDetails } from '../../../../services/api/bookingApi';
import type { IRentalOrder } from '../../../../types/rental';
import type { IRentalDashboardStats } from '../../../../types/rental';
import type { WalletDetails } from '../../../../services/api/walletApi';

interface DashboardOverviewProps {
    bookings: BookingDetails[];
    stats?: IRentalDashboardStats | null;
    statsLoading: boolean;
    onViewBookings: () => void;
    walletData?: WalletDetails | null;
    rentalRequests: IRentalOrder[];
    period: string;
    onPeriodChange: (period: string) => void;
}

export const DashboardOverview = ({
    bookings,
    stats,
    statsLoading,
    onViewBookings,
    walletData,
    rentalRequests,
    period,
    onPeriodChange,
}: DashboardOverviewProps) => {
    const statCards = [
        {
            label: 'Total Bookings',
            value: stats?.hosting?.totalOrders || 0,
            icon: Calendar,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Active Rentals',
            value: stats?.hosting?.activeRentals || 0,
            icon: Clock,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            label: 'My Listings',
            value: stats?.hosting?.totalListings || 0,
            icon: TrendingUp,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            label: 'Total Earnings',
            value: `$${(stats?.hosting?.totalEarnings || 0).toFixed(2)}`,
            icon: Wallet,
            color: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Stats Cards */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Overview</h2>
                    <select
                        value={period}
                        onChange={(e) => onPeriodChange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`${card.color} rounded-2xl p-6 border border-gray-100 backdrop-blur-sm`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                                    {statsLoading ? (
                                        <div className="h-8 w-20 bg-gray-300 rounded animate-pulse" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    )}
                                </div>
                                <div className={`${card.color} p-3 rounded-xl`}>
                                    <card.icon className={`${card.iconColor}`} size={20} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                                <ArrowUpRight size={14} /> Up from last period
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                        <button
                            onClick={onViewBookings}
                            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                        >
                            View All →
                        </button>
                    </div>

                    {bookings.length > 0 ? (
                        <div className="space-y-3">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{booking.photographerId?.name || 'Photographer'}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(booking.eventDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                            booking.status === 'deposit_paid' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {booking.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No bookings yet</p>
                        </div>
                    )}
                </motion.div>

                {/* Rental Requests */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Rental Requests</h3>
                        {rentalRequests.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                                {rentalRequests.length} Pending
                            </span>
                        )}
                    </div>

                    {rentalRequests.length > 0 ? (
                        <div className="space-y-3">
                            {rentalRequests.slice(0, 5).map((request) => (
                                <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{request.renterId?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {request.items?.[0]?.name || 'Equipment'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                            {request.status || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            ))},
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No pending requests</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Wallet Summary */}
            {walletData && (
                <motion.div variants={itemVariants} className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Wallet Balance</p>
                            <p className="text-4xl font-bold text-gray-900">
                                ${walletData.balance?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-gray-500 mt-3">Ready to withdraw</p>
                        </div>
                        <Wallet className="text-green-600" size={40} />
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
