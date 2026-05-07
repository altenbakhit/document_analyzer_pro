import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { checkAnalysisLimit, incrementAnalysisCount } from "@/lib/check-limits";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check analysis limits
    const limitCheck = await checkAnalysisLimit(session.user.id);
    if (!limitCheck.allowed) {
      return limitCheck.error;
    }

    const { contractContent, clientPosition, isCrossBorder, industryType, fileName, reportLanguage } =
      await request.json();

    if (!contractContent || !clientPosition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const langMap: Record<string, string> = { kk: "Kazakh (Қазақ тілі)", ru: "Russian (Русский)", en: "English" };
    const targetLang = langMap[reportLanguage] || "English";

    const systemPrompt = `IMPORTANT: Provide your ENTIRE response in ${targetLang}. All text fields, analysis, recommendations, legal references, and conclusions must be written in ${targetLang}.

You are an expert legal analyst specializing in Kazakhstan commercial law. Analyze contracts based on RK legislation including Civil Code, Civil Procedure Code, Entrepreneurial Code, Tax Code, and AML/CFT laws.

Provide a comprehensive legal analysis in JSON format:
{
  "executiveSummary": {
    "overallAssessment": "<brief overall evaluation>",
    "protectionLevel": "<Strong/Moderate/Weak>",
    "systemicWeaknesses": ["<weakness 1>", "<weakness 2>"],
    "riskLevel": "<LOW/MEDIUM/HIGH>"
  },
  "legalValidity": {
    "assessment": "<detailed validity analysis under RK law>",
    "requiredElements": ["<element 1>", "<element 2>"],
    "missingElements": ["<missing 1>", "<missing 2>"]
  },
  "riskMatrix": [
    {
      "category": "<Legal/Financial/Tax/Currency/AML/Litigation/Reputational>",
      "clauseReference": "<which clause>",
      "probability": "<Low/Medium/High>",
      "impact": "<Low/Medium/High>",
      "mitigation": "<mitigation strategy>"
    }
  ],
  "clauseAnalysis": [
    {
      "clauseTitle": "<clause name>",
      "issue": "<identified problem>",
      "legalBasis": "<relevant RK law article>",
      "recommendation": "<what to change>"
    }
  ],
  "missingClauses": [
    {
      "clause": "<missing clause name>",
      "importance": "Mandatory/Recommended",
      "reason": "<why it's needed>",
      "legalBasis": "<relevant RK law>"
    }
  ],
  "taxAndFinancialRisks": {
    "assessment": "<detailed tax risk analysis>",
    "risks": ["<risk 1>", "<risk 2>"],
    "recommendations": ["<recommendation 1>"]
  },
  "litigationRisks": {
    "assessment": "<litigation risk analysis>",
    "enforceability": "<how enforceable under RK law>",
    "disputeResolution": "<analysis of dispute resolution mechanisms>"
  },
  "recommendedRevisions": [
    {
      "clause": "<clause to revise>",
      "currentWording": "<current text>",
      "proposedWording": "<proposed text>",
      "rationale": "<why this change>"
    }
  ],
  "finalConclusion": "<comprehensive conclusion with overall risk rating and key actions>"
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    // Build user message content for Claude
    let userContent: Anthropic.MessageParam["content"];

    if (contractContent.startsWith("PDF_BASE64:")) {
      const base64Data = contractContent.replace("PDF_BASE64:", "");
      userContent = [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64Data,
          },
        },
        {
          type: "text",
          text: `Analyze this contract from the perspective of a ${clientPosition}${isCrossBorder ? " in a cross-border transaction" : ""}${industryType ? ` in the ${industryType} industry` : ""} under Kazakhstan law.`,
        },
      ];
    } else {
      userContent = `Analyze the following contract from the perspective of a ${clientPosition}${isCrossBorder ? " in a cross-border transaction" : ""}${industryType ? ` in the ${industryType} industry` : ""} under Kazakhstan law.

Contract:
${contractContent}`;
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const responseContent = message.content[0];
    if (responseContent.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const analysisResult = JSON.parse(responseContent.text);

    // Save to database
    const analysis = await prisma.contractAnalysis.create({
      data: {
        userId: session.user.id,
        contractText: contractContent.startsWith("PDF_BASE64:") ? null : contractContent,
        fileName: fileName || null,
        clientPosition,
        isCrossBorder,
        industryType: industryType || null,
        analysisResult,
        riskLevel: analysisResult?.executiveSummary?.riskLevel || null,
      },
    });

    // Increment usage counter
    await incrementAnalysisCount(session.user.id);

    return NextResponse.json({ id: analysis.id });
  } catch (error) {
    console.error("Contract analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze contract" },
      { status: 500 }
    );
  }
}
