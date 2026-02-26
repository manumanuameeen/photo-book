import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
    Calendar,
    Clock,
    Wallet,
    TrendingUp,
    TrendingDown,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Camera,
    Star,
    Camera as CameraIcon
} from "lucide-react";
import type { BookingDetails } from "../../../../services/api/bookingApi";
import type { IRentalDashboardStats, IRentalOrder } from "../../../../types/rental";
import type { WalletDetails } from "../../../../services/api/walletApi";
import { useNavigate } from "@tanstack/react-router";
import { ROUTES } from "../../../../constants/routes";

interface DashboardOverviewProps {
    bookings: BookingDetails[];
    stats: IRentalDashboardStats | null;
    statsLoading: boolean;
    onViewBookings: () => void;
    walletData: WalletDetails | undefined;
    rentalRequests: IRentalOrder[];
}

export const DashboardOverview = ({ bookings, stats, statsLoading, onViewBookings, walletData, rentalRequests }: DashboardOverviewProps) => {
    const navigate = useNavigate();

    const totalEarnings = stats?.hosting.totalEarnings || 0;
    const totalSpent = stats?.renting.totalSpent || 0;
    const walletBalance = walletData?.balance || 0;
    const activeRentals = (stats?.hosting.activeRentals || 0) + (stats?.renting.activeRents || 0);
    const photographerSpending = stats?.renting.photographerSpending || 0;
    const totalReviews = stats?.hosting.totalReviews || 0;
    const averageRating = stats?.hosting.averageRating || 0;

    const statsCards = [
        {
            title: "Wallet Balance",
            value: `$${walletBalance.toFixed(2)}`,
            icon: Wallet,
            trend: "+12.5%",
            trendUp: true,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            title: "Total Earnings",
            value: `$${totalEarnings.toFixed(2)}`,
            icon: TrendingUp,
            trend: "+8.2%",
            trendUp: true,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "Equipment Spent",
            value: `$${totalSpent.toFixed(2)}`,
            icon: TrendingDown,
            trend: "+2.4%",
            trendUp: false,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100"
        },
        {
            title: "Photographer Spent",
            value: `$${photographerSpending.toFixed(2)}`,
            icon: CameraIcon,
            trend: "+3.1%",
            trendUp: false,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100"
        },
        {
            title: "Active Activities",
            value: activeRentals.toString(),
            icon: ShoppingBag,
            trend: "Current",
            trendUp: true,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            title: "Hosting Reviews",
            value: `${averageRating} (${totalReviews})`,
            icon: Star,
            trend: "Average",
            trendUp: true,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-100"
        }
    ];

    const bookingStatusData = useMemo(() => {
        const statusCounts = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const colors: Record<string, string> = {
            PENDING: '#f59e0b',
            ACCEPTED: '#3b82f6',
            CONFIRMED: '#8b5cf6',
            COMPLETED: '#10b981',
            CANCELLED: '#ef4444',
            REJECTED: '#f43f5e',
        };

        return Object.entries(statusCounts).map(([status, count]) => ({
            name: status,
            value: count,
            color: colors[status] || '#9ca3af'
        })).filter(item => item.value > 0);
    }, [bookings]);

    const upcomingBooking = bookings
        .filter((b) => ['ACCEPTED', 'CONFIRMED', 'WAITING_FOR_DEPOSIT'].includes(b.status) && new Date(b.eventDate) >= new Date())
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0];

    const [timeRange, setTimeRange] = useState<'6m' | '1y'>('6m');

    if (statsLoading) {
        return <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl"></div>
        </div>
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
            >

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div className="flex items-center text-xs font-medium">
                                <span className={`flex items-center gap-1 ${stat.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                                    {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.trend}
                                </span>
                                <span className="text-gray-400 ml-2">vs last month</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">

                        {upcomingBooking ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-75 transition-opacity"></div>

                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded-md">Next Session</span>
                                            <h3 className="text-xl font-bold text-gray-900 mt-3">{upcomingBooking.packageId?.name || 'Photography Session'}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(upcomingBooking.eventDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-gray-900">{new Date(upcomingBooking.eventDate).getDate()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-green-600" />
                                            <span className="font-medium">{upcomingBooking.startTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Camera size={16} className="text-green-600" />
                                            <span className="font-medium">{upcomingBooking.photographerId?.name || 'Photographer'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onViewBookings}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        View Booking Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar size={24} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900">No Upcoming Sessions</h3>
                                <p className="text-sm text-gray-500 mt-2 mb-6">Ready to capture your next moment?</p>
                                <button
                                    onClick={() => navigate({ to: ROUTES.USER.HOME })}
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Find a Photographer
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900">Earnings Overview</h3>
                                    <select
                                        value={timeRange}
                                        onChange={(e) => setTimeRange(e.target.value as '6m' | '1y')}
                                        className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg focus:ring-0 cursor-pointer p-2"
                                    >
                                        <option value="6m">Last 6 Months</option>
                                        <option value="1y">This Year</option>
                                    </select>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.hosting.monthlyEarnings || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `$${value}`} />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number | undefined) => [`$${value?.toFixed(2) ?? '0.00'}`, 'Earnings']}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden flex flex-col items-center justify-center">
                                <div className="flex justify-between items-center mb-2 w-full">
                                    <h3 className="font-bold text-gray-900">Bookings by Status</h3>
                                </div>
                                <div className="h-64 w-full">
                                    {bookingStatusData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={bookingStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {bookingStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">No bookings yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">

                        <div className="bg-green-700 rounded-2xl p-6 text-white shadow-lg shadow-green-900/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <h3 className="text-lg font-bold mb-4 relative z-10">Quick Actions</h3>
                            <div className="space-y-3 relative z-10">
                                <button onClick={() => navigate({ to: ROUTES.USER.RENTAL_MARKETPLACE })} className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm group text-left">
                                    <ShoppingBag className="w-5 h-5 text-green-100 group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium">Rent Equipment</span>
                                </button>
                                <button onClick={() => navigate({ to: ROUTES.USER.HOME })} className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm group text-left">
                                    <Search className="w-5 h-5 text-green-100 group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium">Browse Photographers</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Incoming Requests</h3>
                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">{rentalRequests?.length || 0}</span>
                            </div>
                            <div className="space-y-4">
                                {rentalRequests && rentalRequests.length > 0 ? (
                                    rentalRequests.slice(0, 3).map((req) => (
                                        <div key={req._id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                                                    {'Rental Request'}
                                                </span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">PENDING</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Start: {new Date(req.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 text-xs py-4">No pending requests</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
