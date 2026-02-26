
import React from 'react';
import { User, Star } from 'lucide-react';

interface TopPhotographer {
    id: string;
    name: string;
    image?: string;
    rating: number;
    reviews: number;
    bookings: number;
}

interface TopRentalOwner {
    id: string;
    name: string;
    image?: string;
    revenue: number;
    orders: number;
    items: number;
}

export const TopPhotographersTable: React.FC<{ data: TopPhotographer[] }> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Photographers</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-2 font-semibold text-gray-700">Photographer</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Rating</th>
                            <th className="px-4 py-2 font-semibold text-gray-700 text-right">Bookings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                            {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <User size={16} className="text-gray-400" />}
                                        </div>
                                        <span className="font-medium text-gray-900">{p.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center text-yellow-500 gap-1">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-gray-900 font-medium">{p.rating.toFixed(1)}</span>
                                        <span className="text-gray-400 text-xs">({p.reviews})</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                    {p.bookings}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TopRentalOwnersTable: React.FC<{ data: TopRentalOwner[] }> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Rental Owners</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-2 font-semibold text-gray-700">Owner</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Revenue</th>
                            <th className="px-4 py-2 font-semibold text-gray-700 text-right">Items</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                            {o.image ? <img src={o.image} alt={o.name} className="w-full h-full object-cover" /> : <User size={16} className="text-gray-400" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{o.name}</div>
                                            <div className="text-xs text-gray-500">{o.orders} orders</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    ${o.revenue.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">
                                    {o.items}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
