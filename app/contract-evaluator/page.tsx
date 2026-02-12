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
import { Shield, Upload, Type, AlertTriangle, Globe } from "lucide-react";
import Link from "next/link";
import mammoth from "mammoth";
import { useLanguage } from "@/lib/i18n/language-context";

const CLIENT_POSITIONS = [
  "Buyer", "Supplier", "Contractor", "Employer",
  "Lessor", "Lessee", "Investor", "Shareholder", "Other",
];

const INDUSTRIES = [
  "Financial Services", "Oil & Gas", "Mining", "Manufacturing",
  "Real Estate", "Technology", "Retail", "Healthcare", "Other",
];

export default function ContractEvaluatorPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [inputMethod, setInputMethod] = useState<"text" | "file">("text");
  const [contractText, setContractText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientPosition, setClientPosition] = useState("");
  const [customPosition, setCustomPosition] = useState("");
  const [isCrossBorder, setIsCrossBorder] = useState(false);
  const [industryType, setIndustryType] = useState("");
  const [reportLanguage, setReportLanguage] = useState(lang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  if (status === "unauthenticated") { router.replace("/auth/login"); return null; }
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
    setValidationWarning(null);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return `PDF_BASE64:${base64}`;
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
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

  const validateDocument = async (content: string) => {
    if (content.startsWith("PDF_BASE64:")) return;
    setValidating(true);
    try {
      const res = await fetch("/api/validate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.substring(0, 2000), expectedType: "contract" }),
      });
      const data = await res.json();
      if (data.isValid === false) {
        setValidationWarning(`${t("validation.warning")} "${data.documentType}"${t("validation.notContract")}`);
      }
    } catch {}
    setValidating(false);
  };

  const handleAnalyze = async () => {
    const finalPosition = clientPosition === "Other" ? customPosition : clientPosition;

    if (!finalPosition) { setError(t("contract.selectOrEnter")); return; }
    if (inputMethod === "text" && !contractText) { setError(t("contract.enterText")); return; }
    if (inputMethod === "file" && !file) { setError(t("contract.uploadFileMsg")); return; }

    setLoading(true);
    setError("");

    try {
      let contractContent = contractText;
      let fileName = null;

      if (inputMethod === "file" && file) {
        fileName = file.name;
        contractContent = await extractTextFromFile(file);
      }

      // Validate before analyzing
      if (!validationWarning && contractContent && !contractContent.startsWith("PDF_BASE64:")) {
        await validateDocument(contractContent);
      }

      const response = await fetch("/api/contract/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractContent, clientPosition: finalPosition, isCrossBorder,
          industryType: industryType || null, fileName, reportLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429 && errorData?.message) {
          setError(errorData.message); setLoading(false); return;
        }
        throw new Error(errorData?.error || "Analysis failed");
      }

      const result = await response.json();
      router.push(`/contract-evaluator/results/${result.id}`);
    } catch (err) {
      setError(t("contract.selectOrEnter"));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><LoadingAnalysis /></div>
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
              <h1 className="text-3xl font-bold text-gray-900">{t("contract.title")}</h1>
              <p className="text-gray-600">{t("contract.subtitle")}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              {error.includes("upgrade") && (
                <Link href="/pricing" className="inline-block mt-2">
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                    {t("contract.viewPlans")}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {validationWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">{validationWarning}</p>
                  <div className="flex space-x-3 mt-2">
                    <Button size="sm" variant="outline" onClick={() => setValidationWarning(null)}>
                      {t("validation.continueAnyway")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setValidationWarning(null); setContractText(""); setFile(null); }}>
                      {t("validation.cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Label className="text-gray-700 mb-3 block">{t("contract.inputMethod")}</Label>
              <div className="flex space-x-4">
                <Button type="button" variant={inputMethod === "text" ? "default" : "outline"} onClick={() => setInputMethod("text")} className="flex items-center space-x-2">
                  <Type className="h-4 w-4" /><span>{t("contract.pasteText")}</span>
                </Button>
                <Button type="button" variant={inputMethod === "file" ? "default" : "outline"} onClick={() => setInputMethod("file")} className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" /><span>{t("contract.uploadFile")}</span>
                </Button>
              </div>
            </div>

            {inputMethod === "text" ? (
              <div>
                <Label htmlFor="contractText" className="text-gray-700">{t("contract.contractText")} *</Label>
                <Textarea id="contractText" value={contractText} onChange={(e) => { setContractText(e.target.value); setValidationWarning(null); }} rows={10} placeholder={t("contract.contractPlaceholder")} className="mt-2"
                  onBlur={() => { if (contractText.length > 100) validateDocument(contractText); }}
                />
              </div>
            ) : (
              <div>
                <Label className="text-gray-700 mb-2 block">{t("contract.uploadContract")} *</Label>
                <FileUpload onFileSelected={handleFileSelected} />
              </div>
            )}

            <div>
              <Label className="text-gray-700 mb-2 block">{t("contract.clientPosition")} *</Label>
              <Select value={clientPosition} onValueChange={setClientPosition}>
                <SelectTrigger><SelectValue placeholder={t("contract.selectPosition")} /></SelectTrigger>
                <SelectContent>
                  {CLIENT_POSITIONS.map((pos) => (<SelectItem key={pos} value={pos}>{t(`positions.${pos}`) || pos}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {clientPosition === "Other" && (
              <div>
                <Label htmlFor="customPosition" className="text-gray-700">{t("contract.specifyPosition")} *</Label>
                <Input id="customPosition" value={customPosition} onChange={(e) => setCustomPosition(e.target.value)} placeholder={t("contract.enterPosition")} className="mt-2" />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-gray-700">{t("contract.crossBorder")}</Label>
                <p className="text-sm text-gray-500">{t("contract.crossBorderDesc")}</p>
              </div>
              <Switch checked={isCrossBorder} onCheckedChange={setIsCrossBorder} />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">{t("contract.industryType")}</Label>
              <Select value={industryType} onValueChange={setIndustryType}>
                <SelectTrigger><SelectValue placeholder={t("contract.selectIndustry")} /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (<SelectItem key={ind} value={ind}>{t(`industries.${ind}`) || ind}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Report Language Selector */}
            <div>
              <Label className="text-gray-700 mb-2 flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>{t("contract.reportLanguage")}</span>
              </Label>
              <Select value={reportLanguage} onValueChange={(v: any) => setReportLanguage(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kk">{t("reportLang.kk")}</SelectItem>
                  <SelectItem value="ru">{t("reportLang.ru")}</SelectItem>
                  <SelectItem value="en">{t("reportLang.en")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAnalyze} disabled={loading || validating} className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-lg py-6">
              {validating ? t("validation.checking") : t("contract.analyzeBtn")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
