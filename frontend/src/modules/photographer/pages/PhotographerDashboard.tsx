import React from 'react';
import { useState } from 'react';
import {
    TrendingUp,
    Star,
    User,
    Calendar,
    DollarSign,
    Clock,
    Activity,
    Briefcase,
    ImageIcon,
    MapPin
} from 'lucide-react';
import { motion } from "framer-motion";
import { ROUTES } from "../../../constants/routes";
import { Link } from '@tanstack/react-router';
import { usePhotographerDashboard, useBookingActions } from '../hooks/usePhotographerDashboard';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const PhotographerDashboard = () => {
    const { data: stats, isLoading, error } = usePhotographerDashboard();
    const { acceptBooking, rejectBooking } = useBookingActions();
    const [timeRange, setTimeRange] = useState<'6m' | '1y'>('6m');

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1F2937',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    label: function (context: { parsed: { y: number } }) {
                        return `$${context.parsed.y} Revenue`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: '#9CA3AF'
                }
            },
            y: {
                border: {
                    display: false
                },
                grid: {
                    color: '#F3F4F6',
                },
                ticks: {
                    callback: function (value: string | number) {
                        return '$' + value;
                    },
                    font: {
                        size: 11
                    },
                    color: '#9CA3AF',
                    maxTicksLimit: 5
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
        elements: {
            line: {
                tension: 0.4
            },
            point: {
                radius: 0,
                hoverRadius: 6,
                backgroundColor: '#2E7D46',
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        }
    };

    const getFilteredChartData = () => {
        if (!stats?.revenueTrend) return { labels: [], datasets: [] };

        const data = [...stats.revenueTrend];
        const slicedData = timeRange === '6m' ? data.slice(-6) : data; // Last 6 or all 12

        return {
            labels: slicedData.map(d => d.month),
            datasets: [
                {
                    fill: true,
                    label: 'Revenue',
                    data: slicedData.map(d => d.amount),
                    borderColor: '#2E7D46',
                    backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(46, 125, 70, 0.15)');
                        gradient.addColorStop(1, 'rgba(46, 125, 70, 0.01)');
                        return gradient;
                    },
                    tension: 0.4,
                    pointBackgroundColor: '#2E7D46',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
    if (error) return <div className="text-red-500 text-center p-10">Failed to load dashboard data</div>;

    const statsCards = [
        { title: 'Total Revenue', value: `$${stats?.earnings.total.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: `+${stats?.earnings.growth}% from last month` },
        { title: 'Pending Payouts', value: `$${stats?.earnings.pendingPayouts.toLocaleString()}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Processing' },
        { title: 'Pending Requests', value: stats?.pendingRequests.length || 0, icon: User, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Needs attention' },
        { title: 'Total Sessions', value: stats?.sessions.total, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Lifetime bookings' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-lg">
                                <Activity className="w-5 h-5 text-green-700" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to={ROUTES.USER.WALLET} className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">
                                <DollarSign size={16} />
                                Wallet
                            </Link>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center border border-green-200 text-green-800 font-bold text-sm">
                                <User size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 font-medium">
                                {stat.trend.includes('+') && <TrendingUp size={14} className={`mr-1 ${stat.color}`} />}
                                <span className={stat.trend.includes('+') ? stat.color : 'text-gray-400'}>{stat.trend}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Revenue Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as '6m' | '1y')}
                                    className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-green-500 focus:border-green-500 p-1 bg-gray-50 outline-none"
                                >
                                    <option value="6m">Last 6 Months</option>
                                    <option value="1y">This Year</option>
                                </select>
                            </div>
                            <div className="h-64 w-full">
                                <Line options={chartOptions} data={getFilteredChartData()} />
                            </div>
                        </motion.div>

                        {/* Recent Requests */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Pending Requests</h2>
                                <Link to={ROUTES.PHOTOGRAPHER.BOOKINGS} className="text-sm font-bold text-green-700 hover:text-green-800">View All</Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {stats?.pendingRequests.slice(0, 5).map((req) => (
                                    <div key={req._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                {req.clientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{req.clientName}</p>
                                                <p className="text-xs text-gray-500">{req.eventType} • {req.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => rejectBooking.mutate({ id: req._id, message: '' })}
                                                disabled={rejectBooking.isPending}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => acceptBooking.mutate({ id: req._id, message: '' })}
                                                disabled={acceptBooking.isPending}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.pendingRequests || stats.pendingRequests.length === 0) && (
                                    <div className="p-8 text-center text-gray-400 text-sm">No pending requests</div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-green-700 rounded-2xl p-6 text-white shadow-lg shadow-green-900/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <h2 className="text-lg font-bold mb-4 relative z-10">Quick Actions</h2>
                            <div className="space-y-3 relative z-10">
                                <Link to={ROUTES.PHOTOGRAPHER.EDIT_PROFILE} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    <User className="w-5 h-5" />
                                    <span className="text-sm font-medium">Edit Profile</span>
                                </Link>
                                <Link to={ROUTES.PHOTOGRAPHER.PACKAGES} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    <ImageIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Manage Packages</span>
                                </Link>
                                <Link to={ROUTES.PHOTOGRAPHER.AVAILABILITY} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    <Calendar className="w-5 h-5" />
                                    <span className="text-sm font-medium">View Calendar</span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Upcoming Schedule */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Upcoming</h2>
                                <Link to={ROUTES.PHOTOGRAPHER.BOOKINGS} className="text-xs font-bold text-green-700 hover:text-green-800">See All</Link>
                            </div>
                            <div className="space-y-4">
                                {stats?.upcomingBookings.slice(0, 3).map((booking) => (
                                    <div key={booking._id} className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg min-w-[3.5rem]">
                                            <span className="text-xs font-bold text-gray-500 uppercase">{new Date(booking.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-gray-900">{new Date(booking.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{booking.clientName}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MapPin size={12} />
                                                <span className="line-clamp-1">{booking.location}</span>
                                            </div>
                                            <div className="mt-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.upcomingBookings || stats.upcomingBookings.length === 0) && (
                                    <div className="text-center text-gray-400 text-xs py-4">No upcoming bookings</div>
                                )}
                            </div>
                        </motion.div>

                        {/* Reviews Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Latest Reviews</h2>
                                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                                    <Star className="fill-yellow-500 w-3 h-3" />
                                    <span className="text-xs font-bold">{stats?.reviews.averageRating}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {stats?.reviews.latest.map(review => (
                                    <div key={review._id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-gray-900">{review.clientName}</span>
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < review.rating ? "fill-yellow-500" : "text-gray-200"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{review.comment}"</p>
                                    </div>
                                ))}
                                {(!stats?.reviews.latest || stats.reviews.latest.length === 0) && (
                                    <div className="text-center text-gray-400 text-xs py-4">No reviews yet</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotographerDashboard;
