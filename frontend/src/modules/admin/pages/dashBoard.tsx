

import React from 'react';
import MetricCard from '../../../layouts/admin/MetricCard';
import type { MetricData, ActivityItem } from '../../../layouts/admin/types';

const topMetrics: MetricData[] = [
  { title: 'Total Users', value: '12,847', trend: '+2% from last month', trendColor: 'positive', icon: 'fas fa-users', iconBgColor: 'blue' },
  { title: 'Photographers', value: '1,234', trend: '+8% from last month', trendColor: 'positive', icon: 'fas fa-camera', iconBgColor: 'purple' },
  { title: 'Bookings', value: '3,456', trend: '+15% from last month', trendColor: 'positive', icon: 'fas fa-calendar-check', iconBgColor: 'green' },
];

const smallMetrics: MetricData[] = [
  { title: 'Active Rentals', value: '567', trend: '', trendColor: 'positive', icon: 'fas fa-bicycle', iconBgColor: 'orange', isSmall: true },
  { title: 'Revenue', value: '$89,234', trend: 'Monthly Income', trendColor: 'positive', icon: 'fas fa-dollar-sign', iconBgColor: 'green', isSmall: true },
  { title: 'Platform Assets', value: '$45,678', trend: 'Available Balance', trendColor: 'positive', icon: 'fas fa-cube', iconBgColor: 'purple', isSmall: true },
];

const activities: ActivityItem[] = [
  { id: 1, icon: 'fas fa-user-plus', title: 'New photographer registration', detail: 'John Smith joined - 2 minutes ago', borderColor: 'green' },
  { id: 2, icon: 'fas fa-check-circle', title: 'Equipment rental completed', detail: 'Sarah Johnson returned Canon EOS R5 - 25 min ago', borderColor: 'blue' },
  { id: 3, icon: 'fas fa-credit-card', title: 'Payment processed', detail: 'Rent for Nikon D850 from Mike Dosa - 1 hour ago', borderColor: 'purple' },
  { id: 4, icon: 'fas fa-calendar-alt', title: 'New booking request', detail: 'Canon Videos requested Sony A7 III this weekend - 3 hours ago', borderColor: 'orange' },
];

const DashboardLayout: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topMetrics.map((data, index) => (
          <MetricCard key={index} data={data} />
        ))}
      </div>
      
      {/* Small Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {smallMetrics.map((data, index) => (
          <MetricCard key={index} data={data} />
        ))}
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Charts Section */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md h-64">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Monthly Income</h4>
            <div className="text-gray-400 h-40 flex items-center justify-center">[Chart Placeholder]</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md h-64">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Bookings Trend</h4>
            <div className="text-gray-400 h-40 flex items-center justify-center">[Chart Placeholder]</div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Alerts & Notifications</h4>
            
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-md text-yellow-700 mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i> Pending Verifications
              <p className="text-xs text-gray-600 ml-5">3 Photographer waiting for approval</p>
            </div>
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md text-red-700 mb-2">
              <i className="fas fa-credit-card mr-2"></i> Payment Issues
              <p className="text-xs text-gray-600 ml-5">2 Failed payments alerts</p>
            </div>
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md text-blue-700">
              <i className="fas fa-sync-alt mr-2"></i> System Update
              <p className="text-xs text-gray-600 ml-5">Scheduled maintenance tonight</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activities.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start p-4 bg-gray-50 rounded-lg border-l-4 
                ${item.borderColor === 'green' ? 'border-green-500' : 
                  item.borderColor === 'blue' ? 'border-blue-500' : 
                  item.borderColor === 'purple' ? 'border-purple-500' : 'border-orange-500'
                }`}
            >
              <i className={`${item.icon} text-lg text-gray-600 mr-3 mt-1`}></i>
              <div>
                <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                <small className="text-xs text-gray-500">{item.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;