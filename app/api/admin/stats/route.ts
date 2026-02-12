import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

const prisma = new PrismaClient();

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    totalResumes,
    totalContracts,
    resumesThisMonth,
    contractsThisMonth,
    planDistribution,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.resumeAnalysis.count(),
    prisma.contractAnalysis.count(),
    prisma.resumeAnalysis.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.contractAnalysis.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Get daily analysis counts for the last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [resumesByDay, contractsByDay] = await Promise.all([
    prisma.resumeAnalysis.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    }),
    prisma.contractAnalysis.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    }),
  ]);

  // Aggregate by day
  const dailyStats: Record<string, { resumes: number; contracts: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyStats[key] = { resumes: 0, contracts: 0 };
  }

  resumesByDay.forEach((r) => {
    const key = new Date(r.createdAt).toISOString().split("T")[0];
    if (dailyStats[key]) dailyStats[key].resumes += r._count;
  });

  contractsByDay.forEach((c) => {
    const key = new Date(c.createdAt).toISOString().split("T")[0];
    if (dailyStats[key]) dailyStats[key].contracts += c._count;
  });

  const chartData = Object.entries(dailyStats)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    totalAnalyses: totalResumes + totalContracts,
    totalResumes,
    totalContracts,
    analysesThisMonth: resumesThisMonth + contractsThisMonth,
    planDistribution: planDistribution.map((p) => ({
      plan: p.plan,
      count: p._count.plan,
    })),
    recentUsers,
    chartData,
  });
}
