import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { checkAnalysisLimit, incrementAnalysisCount } from "@/lib/check-limits";

const prisma = new PrismaClient();

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

    // Prepare messages for LLM
    let messages: any[] = [];

    if (contractContent.startsWith("PDF_BASE64:")) {
      const base64Data = contractContent.replace("PDF_BASE64:", "");
      messages = [
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: fileName || "contract.pdf",
                file_data: `data:application/pdf;base64,${base64Data}`,
              },
            },
            {
              type: "text",
              text: `Analyze this contract from the perspective of a ${clientPosition}${isCrossBorder ? " in a cross-border transaction" : ""}${industryType ? ` in the ${industryType} industry` : ""} under Kazakhstan law.`,
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: "user",
          content: `Analyze the following contract from the perspective of a ${clientPosition}${isCrossBorder ? " in a cross-border transaction" : ""}${industryType ? ` in the ${industryType} industry` : ""} under Kazakhstan law.

Contract:
${contractContent}`,
        },
      ];
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

    messages.unshift({ role: "system", content: systemPrompt });

    // Call LLM API with streaming and buffer JSON response
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        stream: true,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("LLM API request failed");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let partialRead = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      partialRead += decoder.decode(value, { stream: true });
      let lines = partialRead.split("\n");
      partialRead = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            break;
          }
          try {
            const parsed = JSON.parse(data);
            buffer += parsed?.choices?.[0]?.delta?.content || "";
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    const analysisResult = JSON.parse(buffer);

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
