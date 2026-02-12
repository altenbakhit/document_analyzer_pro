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

    const { resumeContent, targetJobTitle, industry, jobDescription, fileName } =
      await request.json();

    if (!resumeContent || !targetJobTitle || !industry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare messages for LLM
    let messages: any[] = [];

    if (resumeContent.startsWith("PDF_BASE64:")) {
      // Handle PDF
      const base64Data = resumeContent.replace("PDF_BASE64:", "");
      messages = [
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: fileName || "resume.pdf",
                file_data: `data:application/pdf;base64,${base64Data}`,
              },
            },
            {
              type: "text",
              text: `Extract and analyze this resume for the position of "${targetJobTitle}" in the ${industry} industry.${jobDescription ? ` Target job description: ${jobDescription}` : ""}`,
            },
          ],
        },
      ];
    } else {
      // Handle text
      messages = [
        {
          role: "user",
          content: `Analyze the following resume for the position of "${targetJobTitle}" in the ${industry} industry.${jobDescription ? ` Target job description: ${jobDescription}` : ""}

Resume:
${resumeContent}`,
        },
      ];
    }

    const systemPrompt = `You are an expert resume analyzer. Provide a comprehensive resume analysis in JSON format with the following structure:
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
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("LLM API request failed");
    }

    // Stream and buffer the response
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

    // Parse the complete JSON response
    const analysisResult = JSON.parse(buffer);

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
