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

    const { resumeContent, targetJobTitle, industry, jobDescription, fileName, reportLanguage } =
      await request.json();

    if (!resumeContent || !targetJobTitle || !industry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const langMap: Record<string, string> = { kk: "Kazakh (Қазақ тілі)", ru: "Russian (Русский)", en: "English" };
    const targetLang = langMap[reportLanguage] || "English";

    const systemPrompt = `IMPORTANT: Provide your ENTIRE response in ${targetLang}. All text fields, analysis, recommendations, strengths, weaknesses must be written in ${targetLang}.

You are an expert resume analyzer. Provide a comprehensive resume analysis in JSON format with the following structure:
{
  "overallScore": <number between 0-100>,
  "summary": "<brief overall assessment>",
  "structureAndFormatting": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"]
  },
  "contentQuality": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "achievementBased": "<analysis of achievement vs duty formulations>",
    "specifics": "<analysis of numbers, KPIs, concrete examples>",
    "careerProgression": "<analysis of career logic and progression>"
  },
  "atsOptimization": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "keywords": ["<keyword 1>", "<keyword 2>"],
    "missingKeywords": ["<missing 1>", "<missing 2>"]
  },
  "roleAlignment": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "alignment": "<how well resume matches target role>",
    "gaps": ["<gap 1>", "<gap 2>"]
  },
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ]
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    // Build user message content for Claude
    let userContent: Anthropic.MessageParam["content"];

    if (resumeContent.startsWith("PDF_BASE64:")) {
      const base64Data = resumeContent.replace("PDF_BASE64:", "");
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
          text: `Extract and analyze this resume for the position of "${targetJobTitle}" in the ${industry} industry.${jobDescription ? ` Target job description: ${jobDescription}` : ""}`,
        },
      ];
    } else {
      userContent = `Analyze the following resume for the position of "${targetJobTitle}" in the ${industry} industry.${jobDescription ? ` Target job description: ${jobDescription}` : ""}

Resume:
${resumeContent}`;
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const responseContent = message.content[0];
    if (responseContent.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const analysisResult = JSON.parse(responseContent.text);

    // Save to database
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        resumeText: resumeContent.startsWith("PDF_BASE64:") ? null : resumeContent,
        fileName: fileName || null,
        targetJobTitle,
        industry,
        jobDescription: jobDescription || null,
        analysisResult,
        overallScore: analysisResult?.overallScore || null,
      },
    });

    // Increment usage counter
    await incrementAnalysisCount(session.user.id);

    return NextResponse.json({ id: analysis.id });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
