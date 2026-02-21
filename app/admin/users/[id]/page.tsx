"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Ban, CheckCircle, FileText, Scale, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  analysisCount: number;
  analysisResetDate: string | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  resumeAnalyses: {
    id: string;
    targetJobTitle: string;
    industry: string;
    overallScore: number | null;
    createdAt: string;
  }[];
  contractAnalyses: {
    id: string;
    clientPosition: string;
    riskLevel: string | null;
    createdAt: string;
  }[];
  subscriptions: {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string | null;
    amount: number | null;
  }[];
}

const planColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
  api: "bg-green-100 text-green-700",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const res = await fetch(`/api/admin/users/${params.id}`);
    if (!res.ok) {
      router.push("/admin/users");
      return;
    }
    setUser(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const handleUpdate = async (data: Record<string, any>) => {
    await fetch(`/api/admin/users/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchUser();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name || user.email}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Role</span>
              <Select value={user.role} onValueChange={(v) => handleUpdate({ role: v })}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Plan</span>
              <Select value={user.plan} onValueChange={(v) => handleUpdate({ plan: v })}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">free</SelectItem>
                  <SelectItem value="basic">basic</SelectItem>
                  <SelectItem value="pro">pro</SelectItem>
                  <SelectItem value="enterprise">enterprise</SelectItem>
                  <SelectItem value="api">api</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {user.plan !== "free" && (
              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs"
                  onClick={async () => {
                    if (!confirm("Деактивировать тариф? Пользователь будет переведён на бесплатный план.")) return;
                    await handleUpdate({ plan: "free" });
                    toast.success("Тариф деактивирован");
                  }}
                >
                  <ShieldOff className="h-3 w-3 mr-1" />
                  Деактивировать тариф ({user.plan})
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <Button
                variant="outline"
                size="sm"
                className={`text-xs ${user.isBlocked ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}`}
                onClick={() => handleUpdate({ isBlocked: !user.isBlocked })}
              >
                {user.isBlocked ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Unblock</>
                ) : (
                  <><Ban className="h-3 w-3 mr-1" /> Block</>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Analysis Count</span>
              <span className="text-sm font-medium">{user.analysisCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Joined</span>
              <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Resume Analyses */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Resume Analyses ({user.resumeAnalyses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.resumeAnalyses.length === 0 ? (
              <p className="text-sm text-gray-400">No resume analyses</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {user.resumeAnalyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/analyzer/resume/results/${a.id}`}
                    className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900">{a.targetJobTitle}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{a.industry}</span>
                      {a.overallScore !== null && (
                        <Badge variant="secondary" className={`text-xs ${
                          a.overallScore >= 80 ? "bg-green-100 text-green-700" :
                          a.overallScore >= 60 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {a.overallScore}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Analyses */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Scale className="h-5 w-5 mr-2 text-teal-600" />
              Contract Analyses ({user.contractAnalyses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.contractAnalyses.length === 0 ? (
              <p className="text-sm text-gray-400">No contract analyses</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {user.contractAnalyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/analyzer/contract/results/${a.id}`}
                    className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900">{a.clientPosition}</p>
                    <div className="flex items-center justify-between mt-1">
                      {a.riskLevel && (
                        <Badge variant="secondary" className={`text-xs ${
                          riskColors[a.riskLevel.toLowerCase()] || "bg-gray-100 text-gray-700"
                        }`}>
                          {a.riskLevel}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions */}
      {user.subscriptions.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Subscription History</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Plan</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Start</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">End</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {user.subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-50">
                    <td className="py-2 px-4">
                      <Badge className={planColors[sub.plan] || planColors.free} variant="secondary">{sub.plan}</Badge>
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant={sub.status === "active" ? "default" : "secondary"} className="text-xs">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">{sub.amount ? `${sub.amount} ₸` : "—"}</td>
                    <td className="py-2 px-4">{new Date(sub.startDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
