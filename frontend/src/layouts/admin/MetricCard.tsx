import React from 'react';
import type{ MetricData } from './types';

interface MetricCardProps {
  data: MetricData;
}

const colorMap = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-100',
};

const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const { title, value, trend, trendColor, icon, iconBgColor, isSmall } = data;

  if (isSmall) {
    return (
      <div className={`p-5 rounded-lg shadow-md flex flex-col justify-between relative ${colorMap[iconBgColor]}`}>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 my-1">{value}</h3>
        {trend && <p className="text-xs text-gray-500">{trend}</p>}
        <i className={`${icon} absolute right-3 bottom-3 text-4xl opacity-30 text-gray-600`}></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 my-1">{value}</h3>
        <p className={`text-sm font-semibold ${trendColor === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </p>
      </div>
      <div className={`p-3 rounded-full ${colorMap[iconBgColor]} text-white text-xl`}>
        <i className={icon}></i>
      </div>
    </div>
  );
};

export default MetricCard;