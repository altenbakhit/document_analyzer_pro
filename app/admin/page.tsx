"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  totalAnalyses: number;
  totalResumes: number;
  totalContracts: number;
  analysesThisMonth: number;
  planDistribution: { plan: string; count: number }[];
  recentUsers: { id: string; name: string | null; email: string; plan: string; createdAt: string }[];
  chartData: { date: string; resumes: number; contracts: number }[];
}

const planColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
  api: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <p>Failed to load stats.</p>;

  const userGrowth = stats.newUsersLastMonth > 0
    ? Math.round(((stats.newUsersThisMonth - stats.newUsersLastMonth) / stats.newUsersLastMonth) * 100)
    : stats.newUsersThisMonth > 0 ? 100 : 0;

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      sub: `+${stats.newUsersThisMonth} this month`,
      trend: userGrowth,
    },
    {
      title: "Total Analyses",
      value: stats.totalAnalyses,
      icon: FileText,
      sub: `+${stats.analysesThisMonth} this month`,
    },
    {
      title: "Resumes",
      value: stats.totalResumes,
      icon: TrendingUp,
      sub: "Total resume analyses",
    },
    {
      title: "Contracts",
      value: stats.totalContracts,
      icon: Activity,
      sub: "Total contract analyses",
    },
  ];

  // Calculate max for chart bars
  const maxAnalyses = Math.max(
    ...stats.chartData.map((d) => d.resumes + d.contracts),
    1
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-3 rounded-lg">
                  <card.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              {card.trend !== undefined && (
                <div className="mt-2">
                  <span className={`text-xs font-medium ${card.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {card.trend >= 0 ? "+" : ""}{card.trend}%
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Activity (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-1 h-48">
              {stats.chartData.map((day) => {
                const total = day.resumes + day.contracts;
                const height = maxAnalyses > 0 ? (total / maxAnalyses) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-gradient-to-t from-blue-400 to-teal-400 rounded-t-sm min-h-[2px] transition-all hover:from-blue-500 hover:to-teal-500"
                      style={{ height: `${Math.max(height, 1)}%` }}
                    />
                    <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {day.date}: {total} analyses
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{stats.chartData[0]?.date}</span>
              <span>{stats.chartData[stats.chartData.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.planDistribution.map((p) => (
              <div key={p.plan} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={planColors[p.plan] || planColors.free} variant="secondary">
                    {p.plan}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${(p.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{p.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name || "—"}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={planColors[user.plan] || planColors.free} variant="secondary">
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
