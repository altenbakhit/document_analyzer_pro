"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, FileSearch, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession() || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-4 rounded-2xl shadow-lg">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Powerful AI-Powered
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Document Analysis
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leverage advanced artificial intelligence to analyze resumes and contracts with precision.
            Get instant insights, risk assessments, and actionable recommendations.
          </p>

          <div className="flex items-center justify-center space-x-4">
            {session ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-lg px-8"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-lg px-8"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Resume Evaluator Card */}
          <Link href={session ? "/resume-evaluator" : "/auth/login"}>
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FileSearch className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Evaluator</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive resume analysis with ATS optimization, content quality assessment,
                    and role alignment insights.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      <span>Structure & formatting analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      <span>ATS keyword optimization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      <span>Role & industry alignment</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      <span>Detailed PDF reports</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full bg-blue-500 hover:bg-blue-600">
                    Analyze Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Contract Evaluator Card */}
          <Link href={session ? "/contract-evaluator" : "/auth/login"}>
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-teal-300"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-teal-100 p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Contract Evaluator
                    <span className="text-sm font-normal text-gray-500 ml-2">(Kazakhstan Law)</span>
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Legal contract analysis based on Kazakhstan legislation with risk assessment,
                    compliance checks, and precise recommendations.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                      <span>Legal validity assessment</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                      <span>Multi-dimensional risk matrix</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                      <span>Clause-by-clause analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                      <span>Tax & litigation risk assessment</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full bg-teal-500 hover:bg-teal-600">
                    Analyze Contract
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 Document Analyzer Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
