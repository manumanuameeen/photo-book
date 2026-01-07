import React from 'react';
import {
    User,
    TrendingUp,
    Star
} from 'lucide-react';
import { motion } from "framer-motion";
import { ROUTES } from "../../../constants/routes";
import { Link } from '@tanstack/react-router';
import { usePhotographerDashboard, useBookingActions } from '../hooks/usePhotographerDashboard';
import { MessageBox } from '../../../components/common/MessageBox';

const PhotographerDashboard = () => {
    const { data: stats, isLoading, error } = usePhotographerDashboard();
    const { acceptBooking, rejectBooking } = useBookingActions();
    const [isMessageOpen, setIsMessageOpen] = React.useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-red-500">Failed to load dashboard. Please try again later.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 font-sans text-gray-800"
        >

            {/* MessageBox Modal Overlay */}
            {isMessageOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox onClose={() => setIsMessageOpen(false)} />
                </div>
            )}

            {/* --- Header --- */}
            <header className="bg-[#2E7D46] text-white p-6 md:px-10 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <User size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Welcome back!</h1>
                            <p className="text-sm text-green-100 opacity-90">Manage your sessions, track your earnings, and grow your business.</p>
                        </div>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Transaction History
                    </button>
                </div>
            </header>

            {/* --- Main Content Grid --- */}
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ================= LEFT COLUMN (Sidebar) ================= */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-3 space-y-6"
                >

                    {/* Quick Actions */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to={ROUTES.PHOTOGRAPHER.PROFILE} className="block w-full text-center bg-[#398E50] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#2E7D46] transition-colors shadow-sm">
                                Edit Profile
                            </Link>
                            <Link to="/photographer/portfolio" className="block w-full text-center bg-white border border-green-600 text-green-700 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                                Update Portfolio
                            </Link>
                            <Link to="/photographer/packages" className="block w-full text-center bg-white border border-green-600 text-green-700 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                                Create Packages
                            </Link>
                            <Link to="/photographer/availability" className="block w-full text-center bg-white border border-green-600 text-green-700 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                                Set Availability
                            </Link>
                            <Link to="/photographer/bookings" className="block w-full text-center bg-white border border-green-600 text-green-700 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                                Manage Bookings
                            </Link>
                            <button className="w-full bg-white border border-green-600 text-green-700 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                                Wallet
                            </button>
                        </div>
                    </section>

                    {/* Report Issue */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Report Issue</h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <textarea
                                placeholder="Report any issues with clients or platform problems..."
                                className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-green-500 resize-none h-20"
                            />
                            <button className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                                Submit Report
                            </button>
                        </div>
                    </section>

                    {/* Messages */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Messages</h3>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {stats?.recentMessages.map((msg, i) => (
                                    <div key={i} className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600`}>
                                            {msg.clientName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{msg.clientName}</p>
                                                    {msg.senderRole === 'admin' && (
                                                        <span className="px-1 py-0.5 bg-red-50 text-red-600 rounded text-[7px] font-bold uppercase tracking-tighter shrink-0">Admin</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 shrink-0">{msg.time}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 truncate">{msg.message}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.recentMessages || stats.recentMessages.length === 0) && (
                                    <div className="p-4 text-center text-xs text-gray-400">No new messages</div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMessageOpen(true)}
                                className="w-full py-3 text-xs font-semibold text-green-700 border-t border-gray-100 hover:bg-gray-50"
                            >
                                View All Messages
                            </button>
                        </div>
                    </section>
                </motion.div>

                {/* ================= CENTER COLUMN (Main Feed) ================= */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-5 space-y-6"
                >

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium mb-1">Total Income</p>
                            <h2 className="text-2xl font-bold text-[#2E7D46]">${stats?.earnings.total.toLocaleString()}</h2>
                            <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp size={10} /> +{stats?.earnings.growth}% vs last month
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium mb-1">Pending Payouts</p>
                            <h2 className="text-2xl font-bold text-orange-500">${stats?.earnings.pendingPayouts.toLocaleString()}</h2>
                            <p className="text-[10px] text-gray-400">Awaiting transfer</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium mb-1">Total Sessions</p>
                            <h2 className="text-2xl font-bold text-gray-900">{stats?.sessions.total}</h2>
                            <p className="text-[10px] text-gray-400">{stats?.sessions.newRequests} new requests this week</p>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Pending Requests</h3>
                        <div className="space-y-3">
                            {stats?.pendingRequests.map((req, i) => (
                                <div key={req._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="mb-4">
                                        <h4 className="font-bold text-gray-900">{req.clientName}</h4>
                                        <p className="text-xs text-gray-500">{req.eventType} • {req.date}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptBooking.mutate({ id: req._id })}
                                            disabled={acceptBooking.isPending || rejectBooking.isPending}
                                            className="bg-[#2E7D46] text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-green-800 disabled:opacity-50"
                                        >
                                            {acceptBooking.isPending ? 'Accepting...' : 'Accept'}
                                        </button>
                                        <button
                                            onClick={() => rejectBooking.mutate({ id: req._id })}
                                            disabled={acceptBooking.isPending || rejectBooking.isPending}
                                            className="bg-red-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {rejectBooking.isPending ? 'Rejecting...' : 'Reject'}
                                        </button>
                                        {req._id ? (
                                            <Link
                                                to={ROUTES.PHOTOGRAPHER.BOOKING_DETAILS}
                                                params={{ id: req._id }}
                                                search={{ source: 'dashboard' }}
                                                className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50 flex items-center justify-center"
                                            >
                                                View Details
                                            </Link>
                                        ) : (
                                            <button disabled className="border border-gray-200 text-gray-300 px-4 py-1.5 rounded-md text-xs font-bold cursor-not-allowed flex items-center justify-center">
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!stats?.pendingRequests || stats?.pendingRequests.length === 0) && (
                                <div className="p-4 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">No pending requests</div>
                            )}
                        </div>
                    </section>

                    {/* Upcoming Bookings */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Upcoming Bookings</h3>
                        <div className="space-y-3">
                            {stats?.upcomingBookings.map((booking, i) => (
                                <div key={booking._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                    <div className={`absolute top-5 right-5 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                                            ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'waiting_for_deposit' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                        {booking.status === 'waiting_for_deposit' ? 'Deposit' : booking.status}
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="font-bold text-gray-900">{booking.clientName}</h4>
                                        <p className="text-xs text-gray-500">{booking.date} • {booking.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="bg-[#398E50] text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-green-700">Message Client</button>
                                        {booking._id ? (
                                            <Link
                                                to={ROUTES.PHOTOGRAPHER.BOOKING_DETAILS}
                                                params={{ id: booking._id }}
                                                search={{ source: 'dashboard' }}
                                                className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50 flex items-center justify-center"
                                            >
                                                View Details
                                            </Link>
                                        ) : (
                                            <button disabled className="border border-gray-200 text-gray-300 px-4 py-1.5 rounded-md text-xs font-bold cursor-not-allowed flex items-center justify-center">
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!stats?.upcomingBookings || stats.upcomingBookings.length === 0) && (
                                <div className="p-4 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">No upcoming bookings</div>
                            )}
                        </div>
                    </section>

                </motion.div>

                {/* ================= RIGHT COLUMN (Insights) ================= */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 space-y-6"
                >

                    {/* Performance Insights */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Performance Insights</h3>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-8">

                            {/* Line Chart Mockup */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 mb-4">Monthly Revenue</h4>
                                <div className="relative h-32 w-full border-l border-b border-gray-200">
                                    {/* Simple SVG Line Graph */}
                                    <svg viewBox="0 0 100 50" className="absolute bottom-0 left-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <path
                                            d="M0 35 Q 20 25, 40 10 T 80 5 T 100 20"
                                            fill="none"
                                            stroke="#2E7D46"
                                            strokeWidth="2"
                                        />
                                        <circle cx="0" cy="35" r="2" fill="#2E7D46" />
                                        <circle cx="40" cy="10" r="2" fill="#2E7D46" />
                                        <circle cx="80" cy="5" r="2" fill="#2E7D46" />
                                        <circle cx="100" cy="20" r="2" fill="#2E7D46" />
                                    </svg>
                                    {/* Y-Axis Labels */}
                                    <div className="absolute -left-8 top-0 text-[8px] text-gray-400 flex flex-col justify-between h-full">
                                        <span>$5000</span>
                                        <span>$0</span>
                                    </div>
                                    {/* X-Axis Labels */}
                                    <div className="absolute left-0 -bottom-5 w-full flex justify-between text-[8px] text-gray-400">
                                        <span>Jun</span>
                                        <span>Jul</span>
                                        <span>Aug</span>
                                        <span>Sep</span>
                                        <span>Oct</span>
                                        <span>Nov</span>
                                    </div>
                                </div>
                            </div>

                            {/* Donut Chart Mockup */}
                            <div className="pt-4">
                                <h4 className="text-xs font-bold text-gray-500 mb-4">Session Types</h4>
                                <div className="flex items-center justify-center">
                                    {/* CSS Conic Gradient for Donut Chart */}
                                    <div
                                        className="w-32 h-32 rounded-full relative"
                                        style={{
                                            background: 'conic-gradient(#398E50 0% 65%, #FACC15 65% 80%, #64748B 80% 90%, #E2E8F0 90% 100%)'
                                        }}
                                    >
                                        <div className="absolute inset-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#398E50]"></span><span className="text-[10px] text-gray-500">Wedding</span></div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span><span className="text-[10px] text-gray-500">Family</span></div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span><span className="text-[10px] text-gray-500">Commercial</span></div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span><span className="text-[10px] text-gray-500">Portrait</span></div>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Latest Client Reviews */}
                    <section>
                        <h3 className="font-bold text-gray-900 mb-3">Latest Client Reviews</h3>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
                                <div className="text-3xl font-bold text-[#2E7D46] mb-1">{stats?.reviews.averageRating}</div>
                                <div className="flex justify-center gap-1 mb-1">
                                    {[1, 2, 3, 4].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                                    <Star size={14} className="text-yellow-400 fill-yellow-400 opacity-50" />
                                </div>
                                <p className="text-[10px] text-gray-500">Based on {stats?.reviews.totalReviews} reviews</p>
                            </div>

                            <div className="space-y-6">
                                {stats?.reviews.latest.map((review, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <h5 className="text-xs font-bold text-gray-900">{review.clientName}</h5>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, starIndex) => (
                                                    <Star key={starIndex} size={10} className={`${starIndex < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 italic leading-relaxed">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 border border-gray-300 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50">
                                View All Reviews
                            </button>
                        </div>
                    </section>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PhotographerDashboard;
