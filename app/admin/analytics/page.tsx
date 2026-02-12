"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Analysis {
  id: string;
  type: string;
  createdAt: string;
  user: { name: string | null; email: string };
  // Resume fields
  targetJobTitle?: string;
  industry?: string;
  overallScore?: number | null;
  // Contract fields
  clientPosition?: string;
  riskLevel?: string | null;
  isCrossBorder?: boolean;
}

export default function AnalyticsPage() {
  const [resumes, setResumes] = useState<Analysis[]>([]);
  const [contracts, setContracts] = useState<Analysis[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/analyses?type=${typeFilter}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setResumes(data.resumes || []);
        setContracts(data.contracts || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const allAnalyses = [...resumes, ...contracts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">All analyses across the platform</p>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="resume">Resumes</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Details</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Score/Risk</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={5} className="py-4 px-4">
                        <div className="h-6 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : allAnalyses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No analyses found
                    </td>
                  </tr>
                ) : (
                  allAnalyses.map((a) => (
                    <tr key={`${a.type}-${a.id}`} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={a.type === "resume" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"}
                        >
                          {a.type === "resume" ? "Resume" : "Contract"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 text-xs">{a.user?.name || "—"}</p>
                        <p className="text-gray-400 text-xs">{a.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {a.type === "resume"
                          ? `${a.targetJobTitle} — ${a.industry}`
                          : a.clientPosition}
                      </td>
                      <td className="py-3 px-4">
                        {a.type === "resume" && a.overallScore !== null && a.overallScore !== undefined ? (
                          <Badge variant="secondary" className={`text-xs ${
                            a.overallScore >= 80 ? "bg-green-100 text-green-700" :
                            a.overallScore >= 60 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {a.overallScore}%
                          </Badge>
                        ) : a.type === "contract" && a.riskLevel ? (
                          <Badge variant="secondary" className={`text-xs ${
                            a.riskLevel.toLowerCase() === "low" ? "bg-green-100 text-green-700" :
                            a.riskLevel.toLowerCase() === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {a.riskLevel}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
