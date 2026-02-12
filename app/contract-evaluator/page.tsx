"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { LoadingAnalysis } from "@/components/loading-analysis";
import { Shield, Upload, Type } from "lucide-react";
import mammoth from "mammoth";

const CLIENT_POSITIONS = [
  "Buyer",
  "Supplier",
  "Contractor",
  "Employer",
  "Lessor",
  "Lessee",
  "Investor",
  "Shareholder",
  "Other",
];

const INDUSTRIES = [
  "Financial Services",
  "Oil & Gas",
  "Mining",
  "Manufacturing",
  "Real Estate",
  "Technology",
  "Retail",
  "Healthcare",
  "Other",
];

export default function ContractEvaluatorPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [inputMethod, setInputMethod] = useState<"text" | "file">("text");
  const [contractText, setContractText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientPosition, setClientPosition] = useState("");
  const [customPosition, setCustomPosition] = useState("");
  const [isCrossBorder, setIsCrossBorder] = useState(false);
  const [industryType, setIndustryType] = useState("");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
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
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        return result?.value || "";
      }
    }
    throw new Error("Unsupported file type");
  };

  const handleAnalyze = async () => {
    const finalPosition = clientPosition === "Other" ? customPosition : clientPosition;

    if (!finalPosition) {
      setError("Please select or enter client position");
      return;
    }

    if (inputMethod === "text" && !contractText) {
      setError("Please enter contract text");
      return;
    }

    if (inputMethod === "file" && !file) {
      setError("Please upload a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let contractContent = contractText;
      let fileName = null;

      if (inputMethod === "file" && file) {
        fileName = file.name;
        contractContent = await extractTextFromFile(file);
      }

      const response = await fetch("/api/contract/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractContent,
          clientPosition: finalPosition,
          isCrossBorder,
          industryType: industryType || null,
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      router.push(`/contract-evaluator/results/${result.id}`);
    } catch (err) {
      setError("Failed to analyze contract. Please try again.");
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
            <div className="bg-teal-100 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contract Evaluator</h1>
              <p className="text-gray-600">Legal analysis based on Kazakhstan legislation</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          <div className="space-y-6">
            {/* Input Method Toggle */}
            <div>
              <Label className="text-gray-700 mb-3 block">Contract Input Method</Label>
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

            {/* Contract Input */}
            {inputMethod === "text" ? (
              <div>
                <Label htmlFor="contractText" className="text-gray-700">
                  Contract Text *
                </Label>
                <Textarea
                  id="contractText"
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  rows={10}
                  placeholder="Paste your contract text here..."
                  className="mt-2"
                />
              </div>
            ) : (
              <div>
                <Label className="text-gray-700 mb-2 block">Upload Contract *</Label>
                <FileUpload onFileSelected={handleFileSelected} />
              </div>
            )}

            {/* Client Position */}
            <div>
              <Label className="text-gray-700 mb-2 block">Client Position *</Label>
              <Select value={clientPosition} onValueChange={setClientPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your position in the contract" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Position (if Other selected) */}
            {clientPosition === "Other" && (
              <div>
                <Label htmlFor="customPosition" className="text-gray-700">
                  Specify Position *
                </Label>
                <Input
                  id="customPosition"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  placeholder="Enter your position..."
                  className="mt-2"
                />
              </div>
            )}

            {/* Cross-Border Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-gray-700">Cross-Border Transaction</Label>
                <p className="text-sm text-gray-500">Is this an international contract?</p>
              </div>
              <Switch checked={isCrossBorder} onCheckedChange={setIsCrossBorder} />
            </div>

            {/* Industry Type (Optional) */}
            <div>
              <Label className="text-gray-700 mb-2 block">Industry Type (Optional)</Label>
              <Select value={industryType} onValueChange={setIndustryType}>
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

            {/* Submit Button */}
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-lg py-6"
            >
              Analyze Contract
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
