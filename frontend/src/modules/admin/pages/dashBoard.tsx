

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MetricCard from '../../../layouts/admin/MetricCard';
import { adminDashboardApi } from '../../../services/api/adminDashboardApi';
import { LineChart, DoughnutChart, PieChart } from '../components/DashboardCharts';
import { TopPhotographersTable, TopRentalOwnersTable } from '../components/TopPerformers';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminDashboardApi.getStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 bg-red-50 rounded-xl border border-red-100 p-6">
        <AlertCircle className="mr-2" />
        <span className="font-medium">Failed to load dashboard statistics. Please try again later.</span>
      </div>
    );
  }

  // Chart Data Transformers
  const revenueTrendData = {
    labels: stats.revenueTrend.map(d => d.name),
    datasets: [
      {
        label: 'Revenue',
        data: stats.revenueTrend.map(d => d.amount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const revenueSplitData = {
    labels: stats.revenueSplit?.map(d => d.name) || [],
    datasets: [{
      data: stats.revenueSplit?.map(d => d.value) || [],
      backgroundColor: stats.revenueSplit?.map(d => d.color) || ['#3b82f6', '#10b981'],
      borderWidth: 0,
    }]
  };

  const categoryDistData = {
    labels: stats.categoryDistribution?.map(d => d.name) || [],
    datasets: [{
      data: stats.categoryDistribution?.map(d => d.value) || [],
      backgroundColor: stats.categoryDistribution?.map(d => d.color) || ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
        </div>
        <PDFDownloadButton elementId="admin-dashboard-content" fileName="Admin-Report" />
      </div>

      <div id="admin-dashboard-content" className="space-y-8 p-1"> {/* p-1 prevents outline clipping in PDF */}

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.topMetrics.map((data, index) => (
            <MetricCard key={index} data={data} />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <LineChart data={revenueTrendData} title="Revenue Growth" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <PieChart data={revenueSplitData} title="Revenue Split" />
          </div>
        </div>

        {/* Top Performers Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {stats.topPhotographers && <TopPhotographersTable data={stats.topPhotographers} />}
          {stats.topRentalOwners && <TopRentalOwnersTable data={stats.topRentalOwners} />}
        </div>

        {/* Categories & Small Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
            <DoughnutChart data={categoryDistData} title="Category Distribution" />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.smallMetrics.map((data, index) => (
              <MetricCard key={index} data={data} />
            ))}

            {/* Alerts Section */}
            <div className="sm:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">System Alerts</h4>
              <div className="space-y-3">
                {stats.alerts.length > 0 ? (
                  stats.alerts.map((alert, i) => (
                    <div key={i} className={`flex gap-3 p-3 rounded-lg border-l-4 ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        alert.type === 'error' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
                      }`}>
                      <AlertCircle size={20} className={`${alert.type === 'warning' ? 'text-yellow-600' :
                          alert.type === 'error' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                        <p className="text-xs text-gray-600">{alert.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                    <CheckCircle size={20} />
                    <span className="font-medium">All systems operational</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
