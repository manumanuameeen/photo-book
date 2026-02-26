import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import type { IRentalDashboardStats } from '../../types/rental';

interface RentalStatsProps {
    stats: IRentalDashboardStats | null;
    isLoading: boolean;
}

export function RentalStats({ stats, isLoading }: RentalStatsProps) {
    if (isLoading || !stats) {
        return <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                ))}
            </div>
            <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>;
    }

    const hostingCards = [
        {
            label: "Total Earnings",
            value: `$${stats.hosting.totalEarnings.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-700",
            bg: "bg-emerald-50"
        },
        {
            label: "Active Rentals (Hosting)",
            value: stats.hosting.activeRentals,
            icon: ShoppingBag,
            color: "text-blue-700",
            bg: "bg-blue-50"
        },
        {
            label: "Total Listings",
            value: stats.hosting.totalListings,
            icon: Package,
            color: "text-purple-700",
            bg: "bg-purple-50"
        },
        {
            label: "Orders Received",
            value: stats.hosting.totalOrders,
            icon: TrendingUp,
            color: "text-orange-700",
            bg: "bg-orange-50"
        }
    ];

    const rentingCards = [
        {
            label: "Total Spent",
            value: `$${stats.renting.totalSpent.toFixed(2)}`,
            icon: DollarSign,
            color: "text-red-700",
            bg: "bg-red-50"
        },
        {
            label: "Active Rents (Renting)",
            value: stats.renting.activeRents,
            icon: ShoppingBag,
            color: "text-indigo-700",
            bg: "bg-indigo-50"
        },
        {
            label: "Orders Placed",
            value: stats.renting.totalOrders,
            icon: Package,
            color: "text-teal-700",
            bg: "bg-teal-50"
        }
    ];

    return (
        <div className="space-y-8">
            
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#2E7D46]" />
                    Hosting Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hostingCards.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Earnings Overview</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.hosting.monthlyEarnings}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }}
                                    cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-indigo-600" />
                    Renting Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {rentingCards.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
