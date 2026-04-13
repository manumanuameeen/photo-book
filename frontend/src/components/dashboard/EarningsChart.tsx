import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isSameDay, isSameWeek, parseISO } from 'date-fns';

interface Transaction {
    date: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    status: string;
}

interface EarningsChartProps {
    transactions: Transaction[];
}

type FilterType = 'daily' | 'weekly' | 'monthly' | 'custom';

export const EarningsChart: React.FC<EarningsChartProps> = ({ transactions }) => {
    const [filter, setFilter] = useState<FilterType>('daily');
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const creditTxns = transactions.filter(t => t.type === 'CREDIT' && ['COMPLETED', 'PENDING'].includes(t.status));

        const data: { name: string; amount: number; fullDate: Date }[] = [];
        const now = new Date();

        if (filter === 'daily') {

            for (let i = 6; i >= 0; i--) {
                const day = subDays(now, i);
                const dayTotal = creditTxns
                    .filter(t => isSameDay(parseISO(t.date), day))
                    .reduce((sum, t) => sum + t.amount, 0);
                data.push({ name: format(day, 'EEE'), amount: dayTotal, fullDate: day });
            }
        } else if (filter === 'weekly') {

            for (let i = 3; i >= 0; i--) {
                const weekStart = subDays(now, i * 7);
                const weekTotal = creditTxns
                    .filter(t => isSameWeek(parseISO(t.date), weekStart))
                    .reduce((sum, t) => sum + t.amount, 0);
                data.push({ name: `${format(weekStart, 'd MMM')}`, amount: weekTotal, fullDate: weekStart });
            }
        } else if (filter === 'monthly') {

            // for (let i = 5; i >= 0; i--) { }

            const months = new Map<string, number>();
            creditTxns.forEach(t => {
                const d = parseISO(t.date);
                const key = format(d, 'MMM yyyy');
                months.set(key, (months.get(key) || 0) + t.amount);
            });

            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = format(d, 'MMM yyyy');
                const total = months.get(key) || 0;
                data.push({ name: format(d, 'MMM'), amount: total, fullDate: d });
            }

        } else if (filter === 'custom') {
            const start = parseISO(startDate);
            const end = parseISO(endDate);

            const dayMap = new Map<string, number>();
            creditTxns.forEach(t => {
                const d = parseISO(t.date);
                if (d >= start && d <= end) {
                    const key = format(d, 'yyyy-MM-dd');
                    dayMap.set(key, (dayMap.get(key) || 0) + t.amount);
                }
            });

            const sortedDays = Array.from(dayMap.keys()).sort((a, b) => a.localeCompare(b));
            sortedDays.forEach(key => {
                data.push({ name: format(parseISO(key), 'MMM d'), amount: dayMap.get(key) || 0, fullDate: parseISO(key) });
            });
        }

        return data;
    }, [transactions, filter, startDate, endDate]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Earnings Overview</h3>
                    <p className="text-xs text-gray-500">Track your verified income over time</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['daily', 'weekly', 'monthly', 'custom'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${filter === f ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filter === 'custom' && (
                <div className="flex gap-2 mb-4 justify-end text-xs">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-200 rounded p-1" />
                    <span className="self-center">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-200 rounded p-1" />
                </div>
            )}

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2E7D46" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#2E7D46" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#2E7D46', fontWeight: 'bold' }}
                            formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, 'Earnings']}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#2E7D46"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
