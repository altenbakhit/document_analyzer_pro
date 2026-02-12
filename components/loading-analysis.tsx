"use client";

import { motion } from "framer-motion";
import { Loader2, FileText, Brain, CheckCircle } from "lucide-react";

export function LoadingAnalysis() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-16 w-16 text-blue-500" />
      </motion.div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-gray-800">Analyzing Document</h3>
        <p className="text-gray-600">Our AI is processing your document...</p>
      </div>

      <div className="space-y-3 max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-3 text-sm text-gray-600"
        >
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Document received</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center space-x-3 text-sm text-gray-600"
        >
          <FileText className="h-5 w-5 text-blue-500 animate-pulse" />
          <span>Extracting content...</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center space-x-3 text-sm text-gray-600"
        >
          <Brain className="h-5 w-5 text-purple-500 animate-pulse" />
          <span>AI analysis in progress...</span>
        </motion.div>
      </div>
    </div>
  );
}
