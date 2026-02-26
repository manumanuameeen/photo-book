import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isSameDay, isSameWeek, parseISO } from 'date-fns';

interface ClientData {
    date: string;
    count?: number;
}

interface ClientGrowthChartProps {
    data: ClientData[];
}

type FilterType = 'daily' | 'weekly' | 'monthly';

export const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ data }) => {
    const [filter, setFilter] = useState<FilterType>('daily');

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const processedData: { name: string; clients: number }[] = [];
        const now = new Date();

        if (filter === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const day = subDays(now, i);
                const count = data
                    .filter(d => isSameDay(parseISO(d.date), day))
                    .length;
                processedData.push({ name: format(day, 'EEE'), clients: count });
            }
        } else if (filter === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                const weekStart = subDays(now, i * 7);
                const count = data
                    .filter(d => isSameWeek(parseISO(d.date), weekStart))
                    .length;
                processedData.push({ name: format(weekStart, 'd MMM'), clients: count });
            }
        } else if (filter === 'monthly') {
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);

                const count = data.filter(d => {
                    const date = parseISO(d.date);
                    return date.getMonth() === monthStart.getMonth() && date.getFullYear() === monthStart.getFullYear();
                }).length;
                processedData.push({ name: format(monthStart, 'MMM'), clients: count });
            }
        }

        return processedData;
    }, [data, filter]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Client Growth</h3>
                    <p className="text-xs text-gray-500">New clients per period</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${filter === f ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
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
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#F3F4F6' }}
                            itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                        />
                        <Bar
                            dataKey="clients"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
