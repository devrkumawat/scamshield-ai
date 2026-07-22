// controllers/dashboardController.js — Aggregate stats for the dashboard page
import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const emptyDashboard = () => ({
  totals: {
    totalScans: 0,
    safeScans: 0,
    suspiciousScans: 0,
    highRiskScans: 0,
  },
  riskDistribution: { safe: 0, low: 0, suspicious: 0, high: 0, critical: 0 },
  scamCategoryDistribution: [],
  inputTypeDistribution: [],
  recentAnalyses: [],
  trend7Days: [],
});

// GET /api/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
      success: true,
      data: emptyDashboard(),
      note: 'Database not connected — showing empty dashboard.',
    });
  }

  const [totalScans, byLevel, byScamType, byInputType, recent, trend] =
    await Promise.all([
      Analysis.countDocuments({}),
      Analysis.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),
      Analysis.aggregate([
        { $group: { _id: '$scamType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Analysis.aggregate([
        { $group: { _id: '$inputType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analysis.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          'inputType scamType riskScore riskLevel summary createdAt confidence'
        )
        .lean(),
      Analysis.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            total: { $sum: 1 },
            avgRisk: { $avg: '$riskScore' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const riskDistribution = { safe: 0, low: 0, suspicious: 0, high: 0, critical: 0 };
  byLevel.forEach((r) => {
    if (r._id in riskDistribution) riskDistribution[r._id] = r.count;
  });

  const safeScans = riskDistribution.safe + riskDistribution.low;
  const suspiciousScans = riskDistribution.suspicious;
  const highRiskScans = riskDistribution.high + riskDistribution.critical;

  res.status(200).json({
    success: true,
    data: {
      totals: {
        totalScans,
        safeScans,
        suspiciousScans,
        highRiskScans,
      },
      riskDistribution,
      scamCategoryDistribution: byScamType.map((s) => ({
        scamType: s._id || 'Unknown',
        count: s.count,
      })),
      inputTypeDistribution: byInputType.map((s) => ({
        inputType: s._id,
        count: s.count,
      })),
      recentAnalyses: recent,
      trend7Days: trend.map((t) => ({
        date: t._id,
        total: t.total,
        avgRisk: Math.round(t.avgRisk || 0),
      })),
    },
  });
});

export default { getDashboard };
