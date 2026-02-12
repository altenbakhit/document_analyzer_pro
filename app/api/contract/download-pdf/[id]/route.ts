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

    const analysis = await prisma.contractAnalysis.findUnique({
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
      border-bottom: 3px solid #14b8a6;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #14b8a6;
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
    .risk-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 20px 0;
    }
    .risk-low { background: #d1fae5; color: #065f46; }
    .risk-medium { background: #fef3c7; color: #92400e; }
    .risk-high { background: #fee2e2; color: #991b1b; }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-header {
      background: #14b8a6;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .section-content {
      padding: 15px;
      background: #f9fafb;
      border-radius: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 11px;
    }
    th {
      background: #e5e7eb;
      padding: 8px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #d1d5db;
    }
    td {
      padding: 8px;
      border: 1px solid #d1d5db;
    }
    .clause-box {
      background: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .missing-box {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .revision-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .subsection {
      margin-bottom: 12px;
    }
    .subsection-title {
      font-weight: bold;
      color: #374151;
      margin-bottom: 6px;
      font-size: 13px;
    }
    ul {
      margin-left: 20px;
      margin-top: 8px;
    }
    li {
      margin-bottom: 5px;
      font-size: 13px;
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
    <div class="title">Contract Legal Analysis Report</div>
    <div class="subtitle">${analysis.clientPosition}${analysis.isCrossBorder ? " • Cross-Border Transaction" : ""}${analysis.industryType ? ` • ${analysis.industryType}` : ""}</div>
    <div class="subtitle">Jurisdiction: Republic of Kazakhstan</div>
    <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <span class="risk-badge risk-${(result?.executiveSummary?.riskLevel ?? "MEDIUM").toLowerCase()}">
      Risk Level: ${result?.executiveSummary?.riskLevel ?? "MEDIUM"}
    </span>
  </div>

  <div class="section">
    <div class="section-header">Executive Legal Summary</div>
    <div class="section-content">
      <div class="subsection">
        <div class="subsection-title">Protection Level:</div>
        <p>${result?.executiveSummary?.protectionLevel ?? "N/A"}</p>
      </div>
      <div class="subsection">
        <div class="subsection-title">Overall Assessment:</div>
        <p>${result?.executiveSummary?.overallAssessment ?? ""}</p>
      </div>
      ${result?.executiveSummary?.systemicWeaknesses?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Systemic Weaknesses:</div>
          <ul>
            ${result.executiveSummary.systemicWeaknesses.map((w: string) => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-header">Legal Validity and Enforceability</div>
    <div class="section-content">
      <p>${result?.legalValidity?.assessment ?? ""}</p>
      ${result?.legalValidity?.requiredElements?.length > 0 || result?.legalValidity?.missingElements?.length > 0 ? `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
          ${result?.legalValidity?.requiredElements?.length > 0 ? `
            <div>
              <div class="subsection-title">Required Elements Present:</div>
              <ul>
                ${result.legalValidity.requiredElements.map((e: string) => `<li>${e}</li>`).join("")}
              </ul>
            </div>
          ` : ""}
          ${result?.legalValidity?.missingElements?.length > 0 ? `
            <div>
              <div class="subsection-title">Missing Elements:</div>
              <ul>
                ${result.legalValidity.missingElements.map((e: string) => `<li>${e}</li>`).join("")}
              </ul>
            </div>
          ` : ""}
        </div>
      ` : ""}
    </div>
  </div>

  ${result?.riskMatrix?.length > 0 ? `
    <div class="section">
      <div class="section-header">Risk Matrix</div>
      <div class="section-content">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Clause Reference</th>
              <th>Probability</th>
              <th>Impact</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            ${result.riskMatrix.map((risk: any) => `
              <tr>
                <td><strong>${risk?.category ?? "N/A"}</strong></td>
                <td>${risk?.clauseReference ?? "N/A"}</td>
                <td>${risk?.probability ?? "N/A"}</td>
                <td>${risk?.impact ?? "N/A"}</td>
                <td>${risk?.mitigation ?? "N/A"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  ` : ""}

  ${result?.clauseAnalysis?.length > 0 ? `
    <div class="section">
      <div class="section-header">Clause-by-Clause Risk Analysis</div>
      <div class="section-content">
        ${result.clauseAnalysis.map((clause: any) => `
          <div class="clause-box">
            <div class="subsection-title">${clause?.clauseTitle ?? "N/A"}</div>
            <p><strong>Issue:</strong> ${clause?.issue ?? ""}</p>
            <p><strong>Legal Basis:</strong> ${clause?.legalBasis ?? ""}</p>
            <p><strong>Recommendation:</strong> ${clause?.recommendation ?? ""}</p>
          </div>
        `).join("")}
      </div>
    </div>
  ` : ""}

  ${result?.missingClauses?.length > 0 ? `
    <div class="section">
      <div class="section-header">Missing Mandatory or Essential Clauses</div>
      <div class="section-content">
        ${result.missingClauses.map((missing: any) => `
          <div class="missing-box">
            <div class="subsection-title">${missing?.clause ?? "N/A"} (${missing?.importance ?? "N/A"})</div>
            <p><strong>Reason:</strong> ${missing?.reason ?? ""}</p>
            <p><strong>Legal Basis:</strong> ${missing?.legalBasis ?? ""}</p>
          </div>
        `).join("")}
      </div>
    </div>
  ` : ""}

  <div class="section">
    <div class="section-header">Tax and Financial Risk Assessment</div>
    <div class="section-content">
      <p>${result?.taxAndFinancialRisks?.assessment ?? ""}</p>
      ${result?.taxAndFinancialRisks?.risks?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Identified Risks:</div>
          <ul>
            ${result.taxAndFinancialRisks.risks.map((r: string) => `<li>${r}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
      ${result?.taxAndFinancialRisks?.recommendations?.length > 0 ? `
        <div class="subsection">
          <div class="subsection-title">Recommendations:</div>
          <ul>
            ${result.taxAndFinancialRisks.recommendations.map((r: string) => `<li>${r}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-header">Litigation and Enforcement Risk Analysis</div>
    <div class="section-content">
      <div class="subsection">
        <div class="subsection-title">Assessment:</div>
        <p>${result?.litigationRisks?.assessment ?? ""}</p>
      </div>
      <div class="subsection">
        <div class="subsection-title">Enforceability:</div>
        <p>${result?.litigationRisks?.enforceability ?? ""}</p>
      </div>
      <div class="subsection">
        <div class="subsection-title">Dispute Resolution:</div>
        <p>${result?.litigationRisks?.disputeResolution ?? ""}</p>
      </div>
    </div>
  </div>

  ${result?.recommendedRevisions?.length > 0 ? `
    <div class="section">
      <div class="section-header">Precise Recommended Revisions</div>
      <div class="section-content">
        ${result.recommendedRevisions.map((rev: any) => `
          <div class="revision-box">
            <div class="subsection-title">${rev?.clause ?? "N/A"}</div>
            <p><strong>Current Wording:</strong> <em>${rev?.currentWording ?? ""}</em></p>
            <p><strong>Proposed Wording:</strong> ${rev?.proposedWording ?? ""}</p>
            <p><strong>Rationale:</strong> ${rev?.rationale ?? ""}</p>
          </div>
        `).join("")}
      </div>
    </div>
  ` : ""}

  <div class="section">
    <div class="section-header">Final Risk Conclusion</div>
    <div class="section-content">
      <p>${result?.finalConclusion ?? ""}</p>
    </div>
  </div>

  <div class="footer">
    <p>Document Analyzer Pro - Legal Contract Analysis</p>
    <p>Analysis based on Republic of Kazakhstan legislation</p>
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
              "Content-Disposition": `attachment; filename="contract-analysis-${params.id}.pdf"`,
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
