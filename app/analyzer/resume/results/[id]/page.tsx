"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, FileText, Target, Zap, AlertCircle } from "lucide-react";

interface ResumeAnalysisResult {
  id: string;
  overallScore: number;
  summary: string;
  structureAndFormatting: {
    score: number;
    assessment: string;
    strengths: string[];
    weaknesses: string[];
  };
  contentQuality: {
    score: number;
    assessment: string;
    achievementBased: string;
    specifics: string;
    careerProgression: string;
  };
  atsOptimization: {
    score: number;
    assessment: string;
    keywords: string[];
    missingKeywords: string[];
  };
  roleAlignment: {
    score: number;
    assessment: string;
    alignment: string;
    gaps: string[];
  };
  recommendations: string[];
  targetJobTitle: string;
  industry: string;
}

export default function ResumeResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession() || {};
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    if (status === "authenticated" && params?.id) {
      fetchAnalysis();
    }
  }, [status, params?.id]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/resume/results/${params?.id}`);
      if (!response.ok) throw new Error("Failed to fetch analysis");
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/resume/download-pdf/${params?.id}`);
      if (!response.ok) throw new Error("Failed to generate PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-analysis-${params?.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg">{error || "Analysis not found"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis Results</h1>
                <p className="text-gray-600">
                  {analysis.targetJobTitle} • {analysis.industry}
                </p>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Generating..." : "Download PDF"}
              </Button>
            </div>

            {/* Overall Score */}
            <div className="mt-8 flex items-center space-x-6">
              <div className={`${getScoreBg(analysis.overallScore)} rounded-2xl p-6`}>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                  <p className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">out of 100</p>
                </div>
              </div>
              <p className="text-gray-700 flex-1">{analysis.summary}</p>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Structure & Formatting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Structure & Formatting</h3>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis?.structureAndFormatting?.score ?? 0)}`}>
                  {analysis?.structureAndFormatting?.score ?? 0}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{analysis?.structureAndFormatting?.assessment}</p>
              {analysis?.structureAndFormatting?.strengths && analysis.structureAndFormatting.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-green-700 mb-2">Strengths:</p>
                  <ul className="space-y-1">
                    {analysis.structureAndFormatting.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis?.structureAndFormatting?.weaknesses && analysis.structureAndFormatting.weaknesses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">Weaknesses:</p>
                  <ul className="space-y-1">
                    {analysis.structureAndFormatting.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Content Quality */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Content Quality</h3>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis?.contentQuality?.score ?? 0)}`}>
                  {analysis?.contentQuality?.score ?? 0}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{analysis?.contentQuality?.assessment}</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Achievement-Based:</p>
                  <p className="text-gray-600">{analysis?.contentQuality?.achievementBased}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Specifics & Metrics:</p>
                  <p className="text-gray-600">{analysis?.contentQuality?.specifics}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Career Progression:</p>
                  <p className="text-gray-600">{analysis?.contentQuality?.careerProgression}</p>
                </div>
              </div>
            </motion.div>

            {/* ATS Optimization */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Zap className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">ATS Optimization</h3>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis?.atsOptimization?.score ?? 0)}`}>
                  {analysis?.atsOptimization?.score ?? 0}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{analysis?.atsOptimization?.assessment}</p>
              {analysis?.atsOptimization?.keywords && analysis.atsOptimization.keywords.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-green-700 mb-2">Found Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.atsOptimization.keywords.map((k, i) => (
                      <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis?.atsOptimization?.missingKeywords && analysis.atsOptimization.missingKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">Missing Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.atsOptimization.missingKeywords.map((k, i) => (
                      <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Role Alignment */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Role Alignment</h3>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis?.roleAlignment?.score ?? 0)}`}>
                  {analysis?.roleAlignment?.score ?? 0}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{analysis?.roleAlignment?.assessment}</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Alignment Analysis:</p>
                  <p className="text-gray-600">{analysis?.roleAlignment?.alignment}</p>
                </div>
                {analysis?.roleAlignment?.gaps && analysis.roleAlignment.gaps.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700">Identified Gaps:</p>
                    <ul className="space-y-1 mt-2">
                      {analysis.roleAlignment.gaps.map((g, i) => (
                        <li key={i} className="text-gray-600 flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommendations</h3>
            <div className="space-y-4">
              {analysis?.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push("/analyzer/resume")} variant="outline" size="lg">
              Analyze Another Resume
            </Button>
            <Button onClick={() => router.push("/analyzer")} variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
