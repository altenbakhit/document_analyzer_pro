import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, expectedType } = await request.json();

    if (!content || !expectedType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const prompt = `Analyze this document excerpt and determine what type of document it is.

Expected type: ${expectedType}

For "contract": legal documents, agreements, contracts, addendums, MoU, leases, service agreements, NDAs, etc.
For "resume": CV, resume, professional summary, work experience document, etc.

Document excerpt:
${content.substring(0, 1500)}

Return ONLY valid JSON (no markdown, no code blocks):
{"isValid": true/false, "documentType": "detected type", "confidence": 0-100}

Set isValid=true if the document matches the expected type. Set isValid=false if it clearly does NOT match.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 200,
      system: "You are a document classification assistant. Respond with JSON only.",
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = message.content[0];
    if (responseContent.type !== "text") {
      return NextResponse.json({ isValid: true });
    }

    const result = JSON.parse(responseContent.text);

    return NextResponse.json({
      isValid: result.confidence >= 70 && result.isValid !== false,
      documentType: result.documentType || "unknown",
      confidence: result.confidence || 0,
    });
  } catch (error) {
    // On error, don't block the user — assume valid
    return NextResponse.json({ isValid: true });
  }
}
