import { Model } from "mongoose";
import { User } from "../../models/user.model";
import { PhotographerModel } from "../../models/photographer.model";
import { BookingModel } from "../../models/booking.model";
import { RentalOrderModel } from "../../models/rentalOrder.model";
import { WalletModel } from "../../models/wallet.model";
import { ReviewModel } from "../../models/review.model";
import { Report } from "../../models/report.model";
import { AdminDashboardStatsDto } from "../../dto/admin.dashboard.dto";
import { IAdminDashboardService } from "../../interfaces/services/IAdminDashboardService.ts";

export class AdminDashboardService implements IAdminDashboardService {
  async getDashboardStats(startDate?: Date, endDate?: Date): Promise<AdminDashboardStatsDto> {
    const dateFilter: { createdAt?: { $gte?: Date; $lte?: Date } } = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = startDate;
      if (endDate) dateFilter.createdAt.$lte = endDate;
    }

    const [totalUsers, totalPhotographers, totalBookings, activeRentals, adminWallet] =
      await Promise.all([
        User.countDocuments({ role: "user", ...dateFilter }),
        PhotographerModel.countDocuments({ status: "APPROVED", ...dateFilter }),
        BookingModel.countDocuments({ ...dateFilter }),
        RentalOrderModel.countDocuments({ status: "ONGOING", ...dateFilter }),
        WalletModel.findOne({ role: "admin" }),
      ]);

    const volumeResult = await RentalOrderModel.aggregate([
      {
        $match: {
          status: {
            $in: ["COMPLETED", "CONFIRMED", "ONGOING", "DELIVERED", "RETURNED"],
          },
          ...dateFilter,
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalVolume = volumeResult[0]?.total || 0;

    const platformAssets = adminWallet?.balance || 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const revenueTrend: { name: string; amount: number }[] = [];
    const bookingsTrend: { name: string; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const startMonth = new Date(currentYear, currentMonth - i, 1);
      const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
      const monthLabel = startMonth.toLocaleString("default", { month: "short" });

      const [monthBookings, monthRentals, monthRevenueResult] = await Promise.all([
        BookingModel.countDocuments({
          createdAt: { $gte: startMonth, $lt: nextMonth },
        }),
        RentalOrderModel.countDocuments({
          createdAt: { $gte: startMonth, $lt: nextMonth },
        }),
        RentalOrderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: startMonth, $lt: nextMonth },
              status: {
                $in: ["COMPLETED", "CONFIRMED", "ONGOING", "DELIVERED", "RETURNED"],
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

      const monthRevenue = monthRevenueResult[0]?.total || 0;

      bookingsTrend.push({
        name: monthLabel,
        count: monthBookings + monthRentals,
      });
      revenueTrend.push({ name: monthLabel, amount: monthRevenue });
    }

    const [recentUsers, recentBookings] = await Promise.all([
      User.find({ ...dateFilter })
        .sort({ createdAt: -1 })
        .limit(5),
      BookingModel.find({ ...dateFilter })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    interface Activity {
      id: string;
      icon: string;
      title: string;
      detail: string;
      borderColor: string;
      time: Date;
    }

    const activities: Activity[] = [
      ...recentUsers.map((u) => ({
        id: (u._id as string).toString(),
        icon: "fas fa-user-plus",
        title: "New user registration",
        detail: `${u.name} joined`,
        borderColor: "green",
        time: u.createdAt,
      })),
      ...recentBookings.map((b) => {
        const user = b.userId as unknown as { name: string };
        return {
          id: String(b._id),
          icon: "fas fa-calendar-alt",
          title: "New booking request",
          detail: `${user?.name || "Someone"} booked a session`,
          borderColor: "orange",
          time: b.createdAt as Date,
        };
      }),
    ];

    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    const recentActivities = activities.slice(0, 4);

    const [pendingPhotographers, pendingReports] = await Promise.all([
      PhotographerModel.countDocuments({ status: "PENDING" }),
      Report.countDocuments({ status: "pending" }),
    ]);

    interface Alert {
      type: "error" | "info" | "warning";
      title: string;
      detail: string;
    }

    const alerts: Alert[] = [];
    if (pendingPhotographers > 0) {
      alerts.push({
        type: "warning",
        title: "Pending Verifications",
        detail: `${pendingPhotographers} Photographer waiting for approval`,
      });
    }

    const [categoryStats, bookingRevenue, rentalRevenue, topPhotographersRaw, topRentalOwnersRaw] =
      await Promise.all([
        BookingModel.aggregate([
          { $match: { ...dateFilter } },
          { $group: { _id: "$eventType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        BookingModel.aggregate([
          {
            $match: {
              status: {
                $in: ["completed", "work_delivered", "work_ended"],
              },
              ...dateFilter,
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        RentalOrderModel.aggregate([
          {
            $match: {
              status: { $in: ["COMPLETED", "CONFIRMED", "ONGOING"] },
              ...dateFilter,
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        (async () => {
          const photographers = await PhotographerModel.find({
            status: "APPROVED",
          })
            .populate("userId", "name email profileImage")
            .limit(10);

          const stats = await Promise.all(
            photographers.map(async (p) => {
              const [reviews, bookingCount] = await Promise.all([
                ReviewModel.aggregate([
                  { $match: { targetId: p._id } },
                  {
                    $group: {
                      _id: null,
                      avgRating: { $avg: "$rating" },
                      count: { $sum: 1 },
                    },
                  },
                ]),
                BookingModel.countDocuments({
                  photographerId: p._id,
                  status: "completed",
                }),
              ]);

              const user = p.userId as unknown as { name: string; profileImage: string };
              const userName = user.name;
              const userImage = user.profileImage;

              return {
                id: String(p._id),
                name: userName || p.businessInfo?.businessName || "Unknown",
                image: userImage,
                rating: reviews[0]?.avgRating || 0,
                reviews: reviews[0]?.count || 0,
                bookings: bookingCount,
              };
            }),
          );
          return stats.sort((a, b) => b.bookings - a.bookings).slice(0, 5);
        })(),
        RentalOrderModel.aggregate([
          {
            $match: {
              status: {
                $in: ["COMPLETED", "CONFIRMED", "ONGOING", "DELIVERED", "RETURNED"],
              },
              ...dateFilter,
            },
          },
          {
            $lookup: {
              from: "rentalitems",
              localField: "items",
              foreignField: "_id",
              as: "rentedItems",
            },
          },
          {
            $addFields: {
              ownerId: { $arrayElemAt: ["$rentedItems.ownerId", 0] },
            },
          },
          {
            $group: {
              _id: "$ownerId",
              revenue: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
              items: { $sum: { $size: "$items" } },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          { $unwind: "$ownerDetails" },
          {
            $project: {
              _id: 0,
              id: "$_id",
              name: "$ownerDetails.name",
              image: "$ownerDetails.profileImage",
              revenue: 1,
              orders: 1,
              items: 1,
            },
          },
        ]),
      ]);

    const [totalReports, resolvedReports, completedBookings, topRegionsRaw] = await Promise.all([
      Report.countDocuments({ ...dateFilter }),
      Report.countDocuments({ status: { $in: ["resolved", "dismissed"] }, ...dateFilter }),
      BookingModel.countDocuments({
        status: { $in: ["completed", "work_delivered", "work_ended"] },
        ...dateFilter,
      }),
      BookingModel.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: "$location", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 4 },
      ]),
    ]);

    const disputeHealth =
      totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100;
    const conversionRate =
      totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    const topRegions = topRegionsRaw.map((r) => ({
      name: r._id || "Unknown",
      value: r.value,
    }));

    const categoryDistribution = categoryStats.map((c, index) => ({
      name: c._id || "Other",
      value: c.count,
      color: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"][index % 5],
    }));

    const revenueSplit = [
      {
        name: "Bookings",
        value: bookingRevenue[0]?.total || 0,
        color: "#36A2EB",
      },
      {
        name: "Rentals",
        value: rentalRevenue[0]?.total || 0,
        color: "#FF6384",
      },
    ];

    return {
      topMetrics: [
        {
          title: "Total Users",
          value: totalUsers.toLocaleString(),
          trend: await this._getGrowthTrend(User),
          trendColor: "positive",
          icon: "fas fa-users",
          iconBgColor: "blue",
        },
        {
          title: "Photographers",
          value: totalPhotographers.toLocaleString(),
          trend: await this._getGrowthTrend(PhotographerModel),
          trendColor: "positive",
          icon: "fas fa-camera",
          iconBgColor: "purple",
        },
        {
          title: "Bookings",
          value: totalBookings.toLocaleString(),
          trend: await this._getGrowthTrend(BookingModel),
          trendColor: "positive",
          icon: "fas fa-calendar-check",
          iconBgColor: "green",
        },
      ],
      smallMetrics: [
        {
          title: "Active Rentals",
          value: activeRentals.toLocaleString(),
          trend: "",
          trendColor: "positive",
          icon: "fas fa-bicycle",
          iconBgColor: "orange",
          isSmall: true,
        },
        {
          title: "Total Volume",
          value: `$${totalVolume.toLocaleString()}`,
          trend: "Platform total",
          trendColor: "positive",
          icon: "fas fa-dollar-sign",
          iconBgColor: "green",
          isSmall: true,
        },
        {
          title: "Platform Assets",
          value: `$${platformAssets.toLocaleString()}`,
          trend: "Available Balance",
          trendColor: "positive",
          icon: "fas fa-cube",
          iconBgColor: "purple",
          isSmall: true,
        },
        {
          title: "Conversion Rate",
          value: `${conversionRate}%`,
          trend: "Completed vs Total Bookings",
          trendColor: "positive",
          icon: "fas fa-exchange-alt",
          iconBgColor: "blue",
          isSmall: true,
        },
        {
          title: "Dispute Health",
          value: `${disputeHealth}%`,
          trend: "Resolved / Dismissed",
          trendColor:
            disputeHealth >= 80 ? "positive" : disputeHealth >= 60 ? "neutral" : "negative",
          icon: "fas fa-shield-alt",
          iconBgColor: "red",
          isSmall: true,
        },
      ],
      activities: recentActivities,
      revenueTrend,
      bookingsTrend,
      alerts,
      categoryDistribution,
      revenueSplit,
      topPhotographers: topPhotographersRaw,
      topRentalOwners: topRentalOwnersRaw,
      topRegions,
      pendingReportsCount: pendingReports,
    };
  }

  private async _getGrowthTrend<T>(model: Model<T>): Promise<string> {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const newThisMonth = await model.countDocuments({
      createdAt: { $gte: firstDayCurrentMonth },
    });
    const newLastMonth = await model.countDocuments({
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth },
    });

    if (newLastMonth === 0) {
      return newThisMonth > 0 ? "+100% (New setup)" : "0% from last month";
    }

    const growth = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}% from last month`;
  }
}
