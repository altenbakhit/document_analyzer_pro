"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { FileSearch, Shield, Clock, TrendingUp, Zap, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [analyses, setAnalyses] = useState<{
    resume: number; contract: number;
    plan: string; limit: number; used: number; remaining: number; period: string;
  }>({ resume: 0, contract: 0, plan: "free", limit: 3, used: 0, remaining: 3, period: "total" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch user's analysis history
      fetch("/api/analyses/summary")
        .then((res) => res.json())
        .then((data) => {
          setAnalyses(data ?? { resume: 0, contract: 0 });
        })
        .catch(() => {
          // Silent fail
        });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {session?.user?.name || "User"}!
            </h1>
            <p className="mt-2 text-gray-600">Analyze your documents with AI-powered insights</p>
          </div>

          {/* Plan & Limits Banner */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  analyses.plan === "pro" || analyses.plan === "enterprise"
                    ? "bg-gradient-to-br from-purple-100 to-amber-100"
                    : analyses.plan === "basic"
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}>
                  {analyses.plan === "pro" || analyses.plan === "enterprise" ? (
                    <Crown className="h-6 w-6 text-purple-600" />
                  ) : (
                    <Zap className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{analyses.plan} Plan</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      analyses.plan === "free" ? "bg-gray-100 text-gray-600" :
                      analyses.plan === "basic" ? "bg-blue-100 text-blue-700" :
                      analyses.plan === "pro" ? "bg-purple-100 text-purple-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {analyses.period === "total" ? "Lifetime" : "Monthly"}
                    </span>
                  </div>
                  {analyses.limit === -1 ? (
                    <p className="text-sm text-green-600 font-medium">Unlimited analyses</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {analyses.remaining} of {analyses.limit} analyses remaining
                      {analyses.period === "total" ? "" : " this month"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {analyses.limit !== -1 && (
                  <div className="flex-1 sm:w-32">
                    <Progress
                      value={analyses.limit > 0 ? (analyses.used / analyses.limit) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                )}
                {(analyses.plan === "free" || analyses.plan === "basic") && (
                  <Link href="/pricing">
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 whitespace-nowrap">
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            {analyses.limit !== -1 && analyses.remaining <= 1 && analyses.remaining >= 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  {analyses.remaining === 0
                    ? "You've used all your analyses. Upgrade your plan to continue analyzing documents."
                    : "You have only 1 analysis remaining. Consider upgrading your plan."}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileSearch className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resume Analyses</p>
                  <p className="text-2xl font-bold text-gray-900">{analyses?.resume ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contract Analyses</p>
                  <p className="text-2xl font-bold text-gray-900">{analyses?.contract ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analyses?.resume ?? 0) + (analyses?.contract ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/resume-evaluator">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FileSearch className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Evaluator</h3>
                    <p className="text-gray-600 mb-4">
                      Analyze resumes with AI-powered insights for better hiring decisions
                    </p>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      Start Analysis
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/contract-evaluator">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 p-3 rounded-xl">
                    <Shield className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Contract Evaluator</h3>
                    <p className="text-gray-600 mb-4">
                      Comprehensive legal analysis based on Kazakhstan legislation
                    </p>
                    <Button className="bg-teal-500 hover:bg-teal-600">
                      Start Analysis
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-6 w-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
            </div>
            <p className="text-gray-600">Your recent document analyses will appear here</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
