import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Clock, Grid, List, ShoppingBag, User, Wallet, Star } from 'lucide-react';
import { type BookingDetails, bookingApi } from '../../../services/api/bookingApi';
import { rentalApi } from '../../../services/api/rentalApi';
import { messageApi } from '../../../services/api/messageApi';
import { walletApi } from '../../../services/api/walletApi';
import PageTransition from '../../../components/common/PageTransition';
import MyListings from './MyListings';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'sonner';
import type { IRentalOrder } from '../../../types/rental';
import { useRentalDashboard } from '../../../hooks/useRentalDashboard';
import { useAuthStore } from '../../auth/store/useAuthStore';
// import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { UserBookingsTab } from '../components/dashboard/UserBookingsTab';
import { UserRentalsTab } from '../components/dashboard/UserRentalsTab';
import { UserRequestsTab } from '../components/dashboard/UserRequestsTab';
import { UserWalletTab } from '../components/dashboard/UserWalletTab';

import { UserNotificationsTab } from '../components/dashboard/UserNotificationsTab';
import { UserReviewsTab } from '../components/dashboard/UserReviewsTab';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { useUserActions } from '../hooks/useUserBookings';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState<string>(() => {
        const params = new URLSearchParams(globalThis.window.location.search);
        return params.get('tab') || 'overview';
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const params = new URLSearchParams(globalThis.window.location.search);
        if (params.get('tab') !== activeTab) {
            const newUrl = `${globalThis.window.location.pathname}?tab=${activeTab}`;
            globalThis.window.history.replaceState({ ...globalThis.window.history.state, tab: activeTab }, '', newUrl);
        }
    }, [activeTab]);

    const { stats, isLoading: statsLoading, period, setPeriod } = useRentalDashboard();
    const { user } = useAuthStore();
    const { confirmEndWork, confirmDelivery } = useUserActions();

    const [requestsPage, setRequestsPage] = useState(1);
    const [requestsSearch, setRequestsSearch] = useState('');
    const [requestsStatus, setRequestsStatus] = useState('');

    const [bookingsPage, setBookingsPage] = useState(1);
    const [bookingsSearch, setBookingsSearch] = useState('');
    const [bookingsStatus, setBookingsStatus] = useState('');

    const [rentalsPage, setRentalsPage] = useState(1);
    const [rentalsSearch, setRentalsSearch] = useState('');
    const [rentalsStatus, setRentalsStatus] = useState('');

    const [walletPage, setWalletPage] = useState(1);
    const [walletFilter, setWalletFilter] = useState('ALL');

    const [notificationsPage, setNotificationsPage] = useState(1);

    const { data: bookingResponse, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
        queryKey: ['user-bookings', bookingsPage, bookingsSearch, bookingsStatus],
        queryFn: () => bookingApi.getUserBookings(bookingsPage, 10, bookingsSearch, bookingsStatus),
        refetchInterval: 5000
    });

    const bookings = bookingResponse?.bookings || [];
    const bookingsTotalPages = Math.ceil((bookingResponse?.total || 0) / 10) || 1;

    const { data: rentalOrdersResponse, isLoading: rentalsLoading, refetch: refetchRentals } = useQuery({
        queryKey: ['user-rental-orders', rentalsPage, rentalsSearch, rentalsStatus],
        queryFn: () => rentalApi.getUserOrders(rentalsPage, 8, rentalsSearch, rentalsStatus),
        refetchInterval: 5000
    });
    const rentalOrders = rentalOrdersResponse?.data?.items || [];
    const rentalOrdersTotalPages = rentalOrdersResponse?.data?.totalPages || 1;

    const { data: requestsResponse, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
        queryKey: ['owner-rental-requests', requestsPage, requestsSearch, requestsStatus],
        queryFn: () => rentalApi.getOwnerOrders(requestsPage, 8, requestsSearch, requestsStatus),
        refetchInterval: 5000
    });

    const { data: messagesData, isLoading: messagesLoading } = useQuery({
        queryKey: ['user-messages', notificationsPage],
        queryFn: () => messageApi.getMessages(notificationsPage, 5),
        refetchInterval: 10000
    });

    const messages = messagesData?.messages || [];
    const notificationsTotalPages = Math.ceil((messagesData?.total || 0) / 5) || 1;

    const { data: walletData, isLoading: walletLoading, refetch: refetchWalletDetails } = useQuery({
        queryKey: ['user-wallet'],
        queryFn: () => walletApi.getWalletDetails()
    });

    const { data: walletTransactionsData, isLoading: walletTransactionsLoading, refetch: refetchWalletTxs } = useQuery({
        queryKey: ['user-wallet-transactions', walletPage, walletFilter],
        queryFn: () => walletApi.getWalletTransactions(walletPage, 5, walletFilter)
    });
    const walletTransactions = walletTransactionsData?.transactions || [];
    const walletTotalPages = Math.ceil((walletTransactionsData?.total || 0) / 5) || 1;

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => rentalApi.updateOrderStatus(id, status),
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: ['user-rental-orders'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error?.response?.data?.message || "Failed to update status");
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => rentalApi.cancelOrder(id, reason),
        onSuccess: () => {
            toast.success("Order cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ['user-rental-orders'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error?.response?.data?.message || "Failed to cancel order");
        }
    });

    const rentalRequests = requestsResponse?.data?.items || [];
    const rentalRequestsTotalPages = requestsResponse?.data?.totalPages || 1;

    const acceptMutation = useMutation({
        mutationFn: (id: string) => rentalApi.acceptOrder(id),
        onSuccess: () => {
            toast.success("Request accepted");
            queryClient.invalidateQueries({ queryKey: ['owner-rental-requests'] });
        },
        onError: () => toast.error("Failed to accept request")
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => rentalApi.rejectOrder(id),
        onSuccess: () => {
            toast.success("Request rejected");
            queryClient.invalidateQueries({ queryKey: ['owner-rental-requests'] });
        },
        onError: () => toast.error("Failed to reject request")
    });

    const respondToRescheduleMutation = useMutation({
        mutationFn: ({ id, action }: { id: string, action: 'approve' | 'reject' }) => rentalApi.respondToReschedule(id, action),
        onSuccess: () => {
            toast.success("Reschedule response sent");
            queryClient.invalidateQueries({ queryKey: ['owner-rental-requests'] });
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to respond");
        }
    });

    const deleteMessageMutation = useMutation({

        mutationFn: (id: string) => messageApi.deleteMessage(id),
        onSuccess: () => {
            toast.success("Message deleted");
            queryClient.invalidateQueries({ queryKey: ['user-messages'] });
        },
        onError: () => toast.error("Failed to delete message")
    });

    const { mutate: confirmBookingPayment } = useMutation({
        mutationFn: ({ bookingId, sessionId }: { bookingId: string, sessionId: string }) => bookingApi.confirmPayment(bookingId, sessionId),
        onSuccess: () => {
            toast.success("Booking Payment confirmed successfully!");
            queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
            globalThis.window.history.replaceState({}, '', globalThis.window.location.pathname);
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError?.response?.data?.message || "Failed to confirm booking payment");
        }
    });

    const cancelBookingMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => bookingApi.cancelBooking(id, reason),
        onSuccess: () => {
            toast.success("Booking cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error?.response?.data?.message || "Failed to cancel booking");
        }
    });

    const { mutate: payRentalBalance } = useMutation({
        mutationFn: ({ orderId, sessionId }: { orderId: string, sessionId: string }) => rentalApi.payBalance(orderId, sessionId),
        onSuccess: () => {
            toast.success("Rental Balance paid successfully!");
            queryClient.invalidateQueries({ queryKey: ['user-rental-orders'] });
            globalThis.window.history.replaceState({}, '', globalThis.window.location.pathname);
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError?.response?.data?.message || "Failed to confirm rental payment");
        }
    });

    const handleInitiateBalancePayment = async (order: IRentalOrder) => {
        try {
            const response = await rentalApi.createBalancePaymentIntent(order._id);
            if (response.data?.url) {
                globalThis.window.location.href = response.data.url;
            } else if (response.data?.clientSecret) {
                toast.info("Payment intent created. Please implement checkout redirection.");
            } else {
                toast.error("Failed to initiate payment.");
            }
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError?.response?.data?.message || "Failed to initiate payment");
        }
    };

    const handlePayBookingDeposit = async (booking: BookingDetails) => {
        try {
            const response = await bookingApi.createPaymentIntent(booking._id);
            if (response.url) {
                globalThis.window.location.href = response.url;
            } else {
                toast.error("Failed to initiate booking payment.");
            }
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError?.response?.data?.message || "Failed to initiate booking payment");
        }
    };

    const handleInitiateDepositPayment = async (order: IRentalOrder) => {
        try {
            const response = await rentalApi.createPaymentIntent(order._id);
            if (response.data?.url) {
                globalThis.window.location.href = response.data.url;
            } else {
                toast.error("Failed to initiate rental deposit payment.");
            }
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError?.response?.data?.message || "Failed to initiate rental deposit payment");
        }
    };

    const { mutate: payRentalDeposit } = useMutation({
        mutationFn: ({ orderId, sessionId }: { orderId: string, sessionId: string }) => rentalApi.payDeposit(orderId, sessionId),
        onSuccess: () => {
            toast.success("Rental Deposit paid successfully!");
            queryClient.invalidateQueries({ queryKey: ['user-rental-orders'] });
            globalThis.window.history.replaceState({}, '', globalThis.window.location.pathname);
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError?.response?.data?.message || "Failed to confirm rental deposit");
        }
    });

    const processedSessionIds = useRef(new Set<string>());

    useEffect(() => {
        const params = new URLSearchParams(globalThis.window.location.search);
        const paymentStatus = params.get('payment');
        const sessionId = params.get('session_id');
        const bookingId = params.get('bookingId');
        const orderId = params.get('orderId');
        const paymentType = params.get('paymentType');

        if (paymentStatus === 'success' && sessionId) {

            if (processedSessionIds.current.has(sessionId)) {
                return;
            }
            processedSessionIds.current.add(sessionId);

            if (bookingId) {
                confirmBookingPayment({ bookingId, sessionId });
            } else if (orderId) {
                if (paymentType === 'balance') {
                    payRentalBalance({ orderId, sessionId });
                } else {

                    payRentalDeposit({ orderId, sessionId });
                }
            }
        } else if (paymentStatus === 'cancel') {
            toast.info("Payment cancelled");
            globalThis.window.history.replaceState({}, '', globalThis.window.location.pathname);
        }
    }, [confirmBookingPayment, payRentalBalance, payRentalDeposit]);

    return (
        <PageTransition className="min-h-screen bg-gray-50 font-sans text-gray-800">

            <header className="bg-[#2E7D46] text-white p-6 md:px-10 relative shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 overflow-hidden">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={24} className="text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Rental Dashboard</h1>
                            <p className="text-sm text-green-100 opacity-90">Manage your bookings, rentals, and listings.</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3 space-y-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center overflow-hidden">
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-green-700" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">{user?.name || 'User'}</h2>
                                    <p className="text-xs text-gray-500">Member since 2024</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {[
                                    { id: 'overview', label: 'Dashboard', icon: Grid },
                                    { id: 'bookings', label: 'My Bookings', icon: Calendar },
                                    { id: 'rentals', label: 'My Rentals', icon: ShoppingBag },
                                    { id: 'listings', label: 'My Listings', icon: List },
                                    { id: 'wallet', label: 'My Wallet', icon: Wallet },
                                    { id: 'requests', label: 'Rental Requests', icon: Clock },
                                    { id: 'reviews', label: 'My Reviews', icon: Star },
                                    { id: 'notifications', label: 'Notifications', icon: Bell },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-3 relative overflow-hidden group ${activeTab === item.id
                                            ? 'bg-green-50 text-green-700 font-bold'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full transition-transform duration-200 ${activeTab === item.id ? 'scale-y-100' : 'scale-y-0'}`} />
                                        <item.icon size={18} className={activeTab === item.id ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                        {item.label}
                                        {item.id === 'requests' && rentalRequests.length > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{rentalRequests.length}</span>
                                        )}
                                        {item.id === 'notifications' && messages.length > 0 && (
                                            <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{messages.length}</span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="lg:col-span-9"
                    >
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {activeTab === 'overview' && 'Dashboard Overview'}
                                    {activeTab === 'bookings' && 'My Bookings'}
                                    {activeTab === 'rentals' && 'Rental Orders'}
                                    {activeTab === 'listings' && 'My Listings'}
                                    {activeTab === 'wallet' && 'Wallet & Transactions'}
                                    {activeTab === 'requests' && 'Rental Requests'}
                                    {activeTab === 'reviews' && 'My Reviews'}
                                    {activeTab === 'notifications' && 'Notifications'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeTab === 'overview' && `Welcome back, ${user?.name?.split(' ')[0] || 'User'}! Here's what's happening.`}
                                    {activeTab === 'bookings' && 'Manage your photography sessions and bookings.'}
                                    {activeTab === 'rentals' && 'Track your equipment rentals and returns.'}
                                    {activeTab === 'listings' && 'Manage your equipment listings for rent.'}
                                    {activeTab === 'wallet' && 'View your balance and transaction history.'}
                                    {activeTab === 'requests' && 'Manage incoming rental requests from other users.'}
                                    {activeTab === 'reviews' && 'View and manage reviews you have written.'}
                                </p>
                            </div>

                            {activeTab === 'overview' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate({ to: ROUTES.USER.RENTAL_MARKETPLACE })}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <ShoppingBag size={16} /> Rent Gear
                                    </button>
                                    <button
                                        onClick={() => navigate({ to: ROUTES.USER.HOME })}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm shadow-green-200 flex items-center gap-2"
                                    >
                                        <User size={16} /> Find Photographer
                                    </button>
                                </div>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <DashboardOverview
                                    bookings={bookings}
                                    stats={stats || { hosting: {}, renting: {} }}
                                    statsLoading={statsLoading}
                                    onViewBookings={() => setActiveTab('bookings')}
                                    walletData={walletData || { balance: 0 }}
                                    rentalRequests={rentalRequests}
                                    period={period}
                                    onPeriodChange={setPeriod}
                                />
                            )}
                            {activeTab === 'bookings' && (
                                <UserBookingsTab
                                    bookings={bookings}
                                    isLoading={bookingsLoading}
                                    page={bookingsPage}
                                    totalPages={bookingsTotalPages}
                                    onPageChange={setBookingsPage}
                                    onPayDeposit={handlePayBookingDeposit}
                                    onConfirmEndWork={(id) => confirmEndWork.mutate(id)}
                                    onConfirmDelivery={(id) => confirmDelivery.mutate(id)}
                                    onBrowse={() => navigate({ to: ROUTES.USER.HOME })}
                                    onCancel={(id, reason) => cancelBookingMutation.mutate({ id, reason })}
                                    isCancelling={cancelBookingMutation.isPending}
                                    search={bookingsSearch}
                                    onSearchChange={setBookingsSearch}
                                    filter={bookingsStatus}
                                    onFilterChange={setBookingsStatus}
                                    onRefresh={refetchBookings}
                                />
                            )}
                            {activeTab === 'rentals' && (
                                <UserRentalsTab
                                    rentalOrders={rentalOrders}
                                    isLoading={rentalsLoading}
                                    page={rentalsPage}
                                    totalPages={rentalOrdersTotalPages}
                                    onPageChange={setRentalsPage}
                                    onBrowse={() => navigate({ to: ROUTES.USER.RENTAL_MARKETPLACE })}
                                    onCancel={(id, reason) => cancelOrderMutation.mutate({ id, reason })}
                                    onConfirmReceipt={(id) => updateStatusMutation.mutate({ id, status: 'ONGOING' })}
                                    onReturnItem={(id) => updateStatusMutation.mutate({ id, status: 'RETURNED' })}
                                    onPayBalance={handleInitiateBalancePayment}
                                    onPayDeposit={handleInitiateDepositPayment}
                                    isUpdatingStatus={updateStatusMutation.isPending || cancelOrderMutation.isPending}
                                    search={rentalsSearch}
                                    onSearchChange={setRentalsSearch}
                                    filter={rentalsStatus}
                                    onFilterChange={setRentalsStatus}
                                    onRefresh={refetchRentals}
                                />
                            )}
                            {activeTab === 'listings' && (
                                <motion.div key="listings" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                                    <MyListings />
                                </motion.div>
                            )}
                            {activeTab === 'wallet' && (
                                <UserWalletTab
                                    walletData={walletData}
                                    transactions={walletTransactions}
                                    isLoading={walletTransactionsLoading || walletLoading}
                                    page={walletPage}
                                    totalPages={walletTotalPages}
                                    onPageChange={setWalletPage}
                                    filter={walletFilter}
                                    onFilterChange={setWalletFilter}
                                    onRefresh={() => {
                                        refetchWalletDetails();
                                        refetchWalletTxs();
                                    }}
                                />
                            )}
                            {activeTab === 'requests' && (
                                <UserRequestsTab
                                    rentalRequests={rentalRequests}
                                    isLoading={requestsLoading}
                                    page={requestsPage}
                                    totalPages={rentalRequestsTotalPages}
                                    onPageChange={setRequestsPage}
                                    onAccept={(id) => acceptMutation.mutate(id)}
                                    onReject={(id) => rejectMutation.mutate(id)}
                                    onRespondToReschedule={(id, action) => respondToRescheduleMutation.mutate({ id, action })}
                                    onStatusUpdate={(id, status) => rentalApi.updateOrderStatus(id, status).then(() => {

                                        toast.success('Status updated');
                                        queryClient.invalidateQueries({ queryKey: ['owner-rental-requests'] });
                                    }).catch((err: unknown) => {
                                        const error = err as { response?: { data?: { message?: string } } };
                                        toast.error(error?.response?.data?.message || 'Update failed');
                                    })}
                                    isAccepting={acceptMutation.isPending}
                                    isRejecting={rejectMutation.isPending}
                                    search={requestsSearch}
                                    onSearchChange={setRequestsSearch}
                                    filter={requestsStatus}
                                    onFilterChange={setRequestsStatus}
                                    onRefresh={refetchRequests}
                                />
                            )}
                            {activeTab === 'reviews' && (
                                <UserReviewsTab />
                            )}
                            {activeTab === 'notifications' && (
                                <UserNotificationsTab
                                    messages={messages}
                                    isLoading={messagesLoading}
                                    onDelete={(id) => deleteMessageMutation.mutate(id)}
                                    isDeleting={deleteMessageMutation.isPending}
                                    page={notificationsPage}
                                    totalPages={notificationsTotalPages}
                                    onPageChange={setNotificationsPage}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </PageTransition >
    );
};

export default UserDashboard;
