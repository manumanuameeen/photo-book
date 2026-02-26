

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import MetricCard from '../../../layouts/admin/MetricCard';
import { adminDashboardApi } from '../../../services/api/adminDashboardApi';
import { LineChart, DoughnutChart, PieChart, BarChart } from '../components/DashboardCharts';
import { TopPhotographersTable, TopRentalOwnersTable } from '../components/TopPerformers';
import { Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats', startDate, endDate],
    queryFn: () => adminDashboardApi.getStats(startDate, endDate),
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

  const bookingsTrendData = {
    labels: stats.bookingsTrend?.map(d => d.name) || [],
    datasets: [
      {
        label: 'Bookings',
        data: stats.bookingsTrend?.map(d => d.count) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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

  const topRegionsData = {
    labels: stats.topRegions?.map(d => d.name) || [],
    datasets: [
      {
        label: 'Bookings',
        data: stats.topRegions?.map(d => d.value) || [],
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
      }
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const handleExportCSV = () => {
    if (!stats) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "=== Metrics ===\n";
    csvContent += "Title,Value,Trend\n";
    stats.topMetrics.forEach(m => csvContent += `"${m.title}","${m.value}","${m.trend}"\n`);
    stats.smallMetrics.forEach(m => csvContent += `"${m.title}","${m.value}","${m.trend}"\n`);

    csvContent += "\n=== Top Photographers ===\n";
    csvContent += "Name,Rating,Reviews,Bookings\n";
    if (stats.topPhotographers) {
      stats.topPhotographers.forEach(p => csvContent += `"${p.name}","${p.rating}","${p.reviews}","${p.bookings}"\n`);
    }

    csvContent += "\n=== Top Rental Owners ===\n";
    csvContent += "Name,Orders,Items,Revenue\n";
    if (stats.topRentalOwners) {
      stats.topRentalOwners.forEach(r => csvContent += `"${r.name}","${r.orders}","${r.items}","$${r.revenue}"\n`);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admin_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value > endDate) setEndDate(e.target.value);
              }}
              className="text-sm px-3 py-1.5 focus:outline-none border-none bg-transparent"
            />
            <span className="text-gray-400 self-center px-2">to</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm px-3 py-1.5 focus:outline-none border-none bg-transparent"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <div id="admin-dashboard-content" className="space-y-8 p-1">

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.topMetrics.map((data, index) => (
            <MetricCard key={index} data={data} />
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <LineChart data={revenueTrendData} title="Revenue Growth" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <LineChart data={bookingsTrendData} title="Bookings Trend" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <PieChart data={revenueSplitData} title="Revenue Split" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {stats.topPhotographers && <TopPhotographersTable data={stats.topPhotographers} />}
          {stats.topRentalOwners && <TopRentalOwnersTable data={stats.topRentalOwners} />}
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <DoughnutChart data={categoryDistData} title="Category Distribution" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-full">
              <BarChart data={topRegionsData} title="Top Regions by Bookings" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-1 gap-4">
            {stats.smallMetrics.map((data, index) => (
              <MetricCard key={index} data={data} />
            ))}

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
        </motion.div>

      </div >
    </motion.div >
  );
};

export default DashboardLayout;
