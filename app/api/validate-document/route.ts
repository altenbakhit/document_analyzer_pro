import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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

    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are a document classification assistant. Respond with JSON only." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ isValid: true });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");

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
