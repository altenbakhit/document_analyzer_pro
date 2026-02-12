"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { LoadingAnalysis } from "@/components/loading-analysis";
import { FileSearch, Upload, Type, Zap } from "lucide-react";
import Link from "next/link";
import mammoth from "mammoth";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Marketing",
  "Legal",
  "Real Estate",
  "Other",
];

export default function ResumeEvaluatorPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [inputMethod, setInputMethod] = useState<"text" | "file">("text");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.replace("/auth/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError("");
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      // Convert to base64 for LLM processing
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return `PDF_BASE64:${base64}`;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result?.value || "";
      } catch (err) {
        // Fallback to buffer
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        return result?.value || "";
      }
    }
    throw new Error("Unsupported file type");
  };

  const handleAnalyze = async () => {
    if (!targetJobTitle || !industry) {
      setError("Please fill in all required fields");
      return;
    }

    if (inputMethod === "text" && !resumeText) {
      setError("Please enter resume text");
      return;
    }

    if (inputMethod === "file" && !file) {
      setError("Please upload a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let resumeContent = resumeText;
      let fileName = null;

      if (inputMethod === "file" && file) {
        fileName = file.name;
        resumeContent = await extractTextFromFile(file);
      }

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeContent,
          targetJobTitle,
          industry,
          jobDescription: jobDescription || null,
          fileName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429 && errorData?.message) {
          setError(errorData.message);
          setLoading(false);
          return;
        }
        throw new Error(errorData?.error || "Analysis failed");
      }

      const result = await response.json();
      router.push(`/resume-evaluator/results/${result.id}`);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingAnalysis />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileSearch className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Evaluator</h1>
              <p className="text-gray-600">AI-powered resume analysis and optimization</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              {error.includes("upgrade") && (
                <Link href="/pricing" className="inline-block mt-2">
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                    View Plans
                  </Button>
                </Link>
              )}
            </div>
          )}

          <div className="space-y-6">
            {/* Input Method Toggle */}
            <div>
              <Label className="text-gray-700 mb-3 block">Resume Input Method</Label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={inputMethod === "text" ? "default" : "outline"}
                  onClick={() => setInputMethod("text")}
                  className="flex items-center space-x-2"
                >
                  <Type className="h-4 w-4" />
                  <span>Paste Text</span>
                </Button>
                <Button
                  type="button"
                  variant={inputMethod === "file" ? "default" : "outline"}
                  onClick={() => setInputMethod("file")}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </Button>
              </div>
            </div>

            {/* Resume Input */}
            {inputMethod === "text" ? (
              <div>
                <Label htmlFor="resumeText" className="text-gray-700">
                  Resume Text *
                </Label>
                <Textarea
                  id="resumeText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  placeholder="Paste your resume text here..."
                  className="mt-2"
                />
              </div>
            ) : (
              <div>
                <Label className="text-gray-700 mb-2 block">Upload Resume *</Label>
                <FileUpload onFileSelected={handleFileSelected} />
              </div>
            )}

            {/* Target Job Title */}
            <div>
              <Label htmlFor="jobTitle" className="text-gray-700">
                Target Job Title *
              </Label>
              <Input
                id="jobTitle"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="mt-2"
              />
            </div>

            {/* Industry */}
            <div>
              <Label className="text-gray-700 mb-2 block">Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Description (Optional) */}
            <div>
              <Label htmlFor="jobDescription" className="text-gray-700">
                Job Description (Optional)
              </Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the job description for better alignment analysis..."
                className="mt-2"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-lg py-6"
            >
              Analyze Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
