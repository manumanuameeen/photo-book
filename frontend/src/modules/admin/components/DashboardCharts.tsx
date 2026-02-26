
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    type ChartType,
} from 'chart.js';
import { Line, Doughnut, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface ChartProps<T extends ChartType> {
    data: import('chart.js').ChartData<T>;
    title: string;
}

export const LineChart: React.FC<ChartProps<'line'>> = ({ data, title }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: title },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };
    return <Line options={options} data={data} />;
};

export const DoughnutChart: React.FC<ChartProps<'doughnut'>> = ({ data, title }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'right' as const },
            title: { display: true, text: title },
        },
    };
    return <div className="h-64 flex justify-center"><Doughnut options={options} data={data} /></div>;
};

export const PieChart: React.FC<ChartProps<'pie'>> = ({ data, title }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'right' as const },
            title: { display: true, text: title },
        },
    };
    return <div className="h-64 flex justify-center"><Pie options={options} data={data} /></div>;
};

export const BarChart: React.FC<ChartProps<'bar'>> = ({ data, title }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };
    return <Bar options={options} data={data} />;
};
