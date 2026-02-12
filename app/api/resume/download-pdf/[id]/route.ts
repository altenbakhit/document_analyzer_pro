import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analysis = await prisma.resumeAnalysis.findUnique({
      where: { id: params.id },
    });

    if (!analysis || analysis.userId !== session.user.id) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const result = analysis.analysisResult as any;

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #1f2937;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .overall-score {
      background: #f3f4f6;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      color: ${(result?.overallScore ?? 0) >= 80 ? "#10b981" : (result?.overallScore ?? 0) >= 60 ? "#f59e0b" : "#ef4444"};
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-header {
      background: #3b82f6;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-score {
      font-size: 24px;
    }
    .section-content {
      padding: 15px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .subsection {
      margin-bottom: 15px;
    }
    .subsection-title {
      font-weight: bold;
      color: #374151;
      margin-bottom: 8px;
    }
    ul {
      margin-left: 20px;
      margin-top: 8px;
    }
    li {
      margin-bottom: 5px;
    }
    .keyword {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 10px;
      border-radius: 4px;
      margin: 4px;
      font-size: 12px;
    }
    .recommendation {
      background: #eff6ff;
      padding: 15px;
      border-left: 4px solid #3b82f6;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Document Analyzer Pro</div>
    <div class="title">Resume Analysis Report</div>
    <div class="subtitle">${analysis.targetJobTitle} • ${analysis.industry}</div>
    <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="overall-score">
    <div>Overall Score</div>
    <div class="score-value">${result?.overallScore ?? 0}/100</div>
    <div style="margin-top: 15px; color: #6b7280;">${result?.summary ?? ""}</div>
  </div>

  <div class="section">
    <div class="section-header">
      <span>Structure & Formatting</span>
      <span class="section-score">${result?.structureAndFormatting?.score ?? 0}/100</span>
    </div>
    <div class="section-content">
      <p>${result?.structureAndFormatting?.assessment ?? ""}</p>
      ${result?.structureAndFormatting?.strengths?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Strengths:</div>
          <ul>
            ${result.structureAndFormatting.strengths.map((s: string) => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
      ${result?.structureAndFormatting?.weaknesses?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Weaknesses:</div>
          <ul>
            ${result.structureAndFormatting.weaknesses.map((w: string) => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span>Content Quality</span>
      <span class="section-score">${result?.contentQuality?.score ?? 0}/100</span>
    </div>
    <div class="section-content">
      <p>${result?.contentQuality?.assessment ?? ""}</p>
      <div class="subsection">
        <div class="subsection-title">Achievement-Based Analysis:</div>
        <p>${result?.contentQuality?.achievementBased ?? ""}</p>
      </div>
      <div class="subsection">
        <div class="subsection-title">Specifics & Metrics:</div>
        <p>${result?.contentQuality?.specifics ?? ""}</p>
      </div>
      <div class="subsection">
        <div class="subsection-title">Career Progression:</div>
        <p>${result?.contentQuality?.careerProgression ?? ""}</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span>ATS Optimization</span>
      <span class="section-score">${result?.atsOptimization?.score ?? 0}/100</span>
    </div>
    <div class="section-content">
      <p>${result?.atsOptimization?.assessment ?? ""}</p>
      ${result?.atsOptimization?.keywords?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Found Keywords:</div>
          <div>
            ${result.atsOptimization.keywords.map((k: string) => `<span class="keyword">${k}</span>`).join("")}
          </div>
        </div>
      ` : ""}
      ${result?.atsOptimization?.missingKeywords?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Missing Keywords:</div>
          <div>
            ${result.atsOptimization.missingKeywords.map((k: string) => `<span class="keyword">${k}</span>`).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span>Role Alignment</span>
      <span class="section-score">${result?.roleAlignment?.score ?? 0}/100</span>
    </div>
    <div class="section-content">
      <p>${result?.roleAlignment?.assessment ?? ""}</p>
      <div class="subsection">
        <div class="subsection-title">Alignment Analysis:</div>
        <p>${result?.roleAlignment?.alignment ?? ""}</p>
      </div>
      ${result?.roleAlignment?.gaps?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Identified Gaps:</div>
          <ul>
            ${result.roleAlignment.gaps.map((g: string) => `<li>${g}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span>Recommendations</span>
    </div>
    <div class="section-content">
      ${result?.recommendations?.map((rec: string, i: number) => `
        <div class="recommendation">
          <strong>${i + 1}.</strong> ${rec}
        </div>
      `).join("") ?? ""}
    </div>
  </div>

  <div class="footer">
    <p>Document Analyzer Pro - AI-Powered Resume Analysis</p>
    <p>&copy; 2026 All rights reserved</p>
  </div>
</body>
</html>
    `;

    // Call HTML2PDF API
    const createResponse = await fetch("https://apps.abacus.ai/api/createConvertHtmlToPdfRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: { format: "A4", print_background: true },
        base_url: process.env.NEXTAUTH_URL || "",
      }),
    });

    if (!createResponse.ok) {
      throw new Error("Failed to create PDF request");
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      throw new Error("No request ID returned");
    }

    // Poll for status
    const maxAttempts = 300;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch("https://apps.abacus.ai/api/getConvertHtmlToPdfStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: request_id,
          deployment_token: process.env.ABACUSAI_API_KEY,
        }),
      });

      const statusResult = await statusResponse.json();
      const status = statusResult?.status || "FAILED";
      const pdfResult = statusResult?.result || null;

      if (status === "SUCCESS") {
        if (pdfResult?.result) {
          const pdfBuffer = Buffer.from(pdfResult.result, "base64");
          return new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="resume-analysis-${params.id}.pdf"`,
            },
          });
        } else {
          throw new Error("PDF generation completed but no result data");
        }
      } else if (status === "FAILED") {
        throw new Error(pdfResult?.error || "PDF generation failed");
      }

      attempts++;
    }

    throw new Error("PDF generation timed out");
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
