"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Download, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ContractAnalysisResult {
  id: string;
  clientPosition: string;
  isCrossBorder: boolean;
  industryType?: string;
  executiveSummary: {
    overallAssessment: string;
    protectionLevel: string;
    systemicWeaknesses: string[];
    riskLevel: string;
  };
  legalValidity: {
    assessment: string;
    requiredElements: string[];
    missingElements: string[];
  };
  riskMatrix: Array<{
    category: string;
    clauseReference: string;
    probability: string;
    impact: string;
    mitigation: string;
  }>;
  clauseAnalysis: Array<{
    clauseTitle: string;
    issue: string;
    legalBasis: string;
    recommendation: string;
  }>;
  missingClauses: Array<{
    clause: string;
    importance: string;
    reason: string;
    legalBasis: string;
  }>;
  taxAndFinancialRisks: {
    assessment: string;
    risks: string[];
    recommendations: string[];
  };
  litigationRisks: {
    assessment: string;
    enforceability: string;
    disputeResolution: string;
  };
  recommendedRevisions: Array<{
    clause: string;
    currentWording: string;
    proposedWording: string;
    rationale: string;
  }>;
  finalConclusion: string;
}

export default function ContractResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession() || {};
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null);
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
      const response = await fetch(`/api/contract/results/${params?.id}`);
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
      const response = await fetch(`/api/contract/download-pdf/${params?.id}`);
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract-analysis-${params?.id}.pdf`;
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

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      LOW: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-red-100 text-red-800",
    };
    return colors[riskLevel as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Analysis Results</h1>
                <p className="text-gray-600">
                  {analysis.clientPosition}
                  {analysis.isCrossBorder && " • Cross-Border"}
                  {analysis.industryType && ` • ${analysis.industryType}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">Analyzed under Republic of Kazakhstan law</p>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-8 w-8 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">Executive Legal Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 font-medium">Risk Level:</span>
                <span className={`px-4 py-1 rounded-full font-semibold ${getRiskBadge(analysis?.executiveSummary?.riskLevel ?? "MEDIUM")}`}>
                  {analysis?.executiveSummary?.riskLevel ?? "MEDIUM"}
                </span>
              </div>

              <div>
                <p className="text-gray-600 font-medium mb-2">Protection Level:</p>
                <p className="text-gray-800">{analysis?.executiveSummary?.protectionLevel ?? "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-600 font-medium mb-2">Overall Assessment:</p>
                <p className="text-gray-800">{analysis?.executiveSummary?.overallAssessment ?? ""}</p>
              </div>

              {analysis?.executiveSummary?.systemicWeaknesses && analysis.executiveSummary.systemicWeaknesses.length > 0 && (
                <div>
                  <p className="text-gray-600 font-medium mb-2">Systemic Weaknesses:</p>
                  <ul className="space-y-2">
                    {analysis.executiveSummary.systemicWeaknesses.map((w, i) => (
                      <li key={i} className="flex items-start space-x-2 text-gray-700">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* Legal Validity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Legal Validity and Enforceability</h3>
            <p className="text-gray-700 mb-4">{analysis?.legalValidity?.assessment ?? ""}</p>

            <div className="grid md:grid-cols-2 gap-6">
              {analysis?.legalValidity?.requiredElements && analysis.legalValidity.requiredElements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2">Required Elements Present:</p>
                  <ul className="space-y-1">
                    {analysis.legalValidity.requiredElements.map((e, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis?.legalValidity?.missingElements && analysis.legalValidity.missingElements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">Missing Elements:</p>
                  <ul className="space-y-1">
                    {analysis.legalValidity.missingElements.map((e, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* Risk Matrix */}
          {analysis?.riskMatrix && analysis.riskMatrix.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Clause Reference</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Probability</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Impact</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Mitigation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.riskMatrix.map((risk, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="px-4 py-3 font-medium text-gray-900">{risk?.category ?? "N/A"}</td>
                        <td className="px-4 py-3 text-gray-700">{risk?.clauseReference ?? "N/A"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            risk?.probability === "High" ? "bg-red-100 text-red-800" :
                            risk?.probability === "Medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {risk?.probability ?? "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            risk?.impact === "High" ? "bg-red-100 text-red-800" :
                            risk?.impact === "Medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {risk?.impact ?? "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{risk?.mitigation ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Clause Analysis */}
          {analysis?.clauseAnalysis && analysis.clauseAnalysis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Clause-by-Clause Risk Analysis</h3>
              <div className="space-y-4">
                {analysis.clauseAnalysis.map((clause, i) => (
                  <div key={i} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h4 className="font-bold text-gray-900 mb-2">{clause?.clauseTitle ?? "N/A"}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Issue: </span>
                        <span className="text-gray-600">{clause?.issue ?? ""}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Legal Basis: </span>
                        <span className="text-gray-600">{clause?.legalBasis ?? ""}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Recommendation: </span>
                        <span className="text-gray-600">{clause?.recommendation ?? ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Missing Clauses */}
          {analysis?.missingClauses && analysis.missingClauses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Missing Mandatory or Essential Clauses</h3>
              <div className="space-y-4">
                {analysis.missingClauses.map((missing, i) => (
                  <div key={i} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{missing?.clause ?? "N/A"}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        missing?.importance === "Mandatory" ? "bg-red-200 text-red-900" : "bg-yellow-200 text-yellow-900"
                      }`}>
                        {missing?.importance ?? "N/A"}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Reason: </span>
                        <span className="text-gray-600">{missing?.reason ?? ""}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Legal Basis: </span>
                        <span className="text-gray-600">{missing?.legalBasis ?? ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tax and Financial Risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tax and Financial Risk Assessment</h3>
            <p className="text-gray-700 mb-4">{analysis?.taxAndFinancialRisks?.assessment ?? ""}</p>

            {analysis?.taxAndFinancialRisks?.risks && analysis.taxAndFinancialRisks.risks.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-gray-700 mb-2">Identified Risks:</p>
                <ul className="space-y-1">
                  {analysis.taxAndFinancialRisks.risks.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis?.taxAndFinancialRisks?.recommendations && analysis.taxAndFinancialRisks.recommendations.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {analysis.taxAndFinancialRisks.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Litigation Risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Litigation and Enforcement Risk Analysis</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Assessment:</p>
                <p className="text-gray-700">{analysis?.litigationRisks?.assessment ?? ""}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Enforceability:</p>
                <p className="text-gray-700">{analysis?.litigationRisks?.enforceability ?? ""}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Dispute Resolution:</p>
                <p className="text-gray-700">{analysis?.litigationRisks?.disputeResolution ?? ""}</p>
              </div>
            </div>
          </motion.div>

          {/* Recommended Revisions */}
          {analysis?.recommendedRevisions && analysis.recommendedRevisions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Precise Recommended Revisions</h3>
              <div className="space-y-6">
                {analysis.recommendedRevisions.map((rev, i) => (
                  <div key={i} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-bold text-gray-900 mb-3">{rev?.clause ?? "N/A"}</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Current Wording:</p>
                        <p className="text-gray-600 italic bg-white p-2 rounded">{rev?.currentWording ?? ""}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Proposed Wording:</p>
                        <p className="text-gray-600 font-medium bg-green-50 p-2 rounded border border-green-200">
                          {rev?.proposedWording ?? ""}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Rationale:</p>
                        <p className="text-gray-600">{rev?.rationale ?? ""}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Final Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-md p-8 border-2 border-teal-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Final Risk Conclusion</h3>
            <p className="text-gray-800 leading-relaxed">{analysis?.finalConclusion ?? ""}</p>
          </motion.div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push("/analyzer/contract")} variant="outline" size="lg">
              Analyze Another Contract
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
