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

    return NextResponse.json({
      id: analysis.id,
      clientPosition: analysis.clientPosition,
      isCrossBorder: analysis.isCrossBorder,
      industryType: analysis.industryType,
      ...(analysis.analysisResult as object),
    });
  } catch (error) {
    console.error("Error fetching contract analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
