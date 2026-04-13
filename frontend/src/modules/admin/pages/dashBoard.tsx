

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import MetricCard from '../../../layouts/admin/MetricCard';
import { adminDashboardApi } from '../../../services/api/adminDashboardApi';
import { LineChart, DoughnutChart, PieChart, BarChart } from '../components/DashboardCharts';
import { TopRentalOwnersTable } from '../components/TopPerformers';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardLayout: React.FC = () => {


  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminDashboardApi.getStats(),
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
          {/* {stats.topPhotographers && <TopPhotographersTable data={stats.topPhotographers} />} */}
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
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Reviews</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4 flex-grow">
              {stats.recentReviews.length > 0 ? (
                stats.recentReviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{review.reviewerName}</span>
                        <span className="text-gray-400 text-xs mx-2">•</span>
                        <span className="text-gray-500 text-xs">on {review.targetName}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 italic">"{review.comment}"</p>
                    <div className="mt-2 text-[10px] text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <p>No recent reviews found</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Real-time Activity</h3>
            <div className="space-y-6 flex-grow overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {stats.activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative">
                  <div className="flex-shrink-0 relative z-10 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                    <i className={`${activity.icon} text-sm`} style={{ color: activity.borderColor }}></i>
                  </div>
                  <div className="flex-grow pt-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activity.detail}</p>
                  </div>
                  <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-gray-100 last:hidden"></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-1 gap-4">
            {stats.smallMetrics.map((data, index) => (
              <MetricCard key={index} data={data} />
            ))}

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
