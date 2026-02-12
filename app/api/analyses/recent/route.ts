import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [resumes, contracts] = await Promise.all([
      prisma.resumeAnalysis.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          targetJobTitle: true,
          industry: true,
          overallScore: true,
          fileName: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.contractAnalysis.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          clientPosition: true,
          industryType: true,
          riskLevel: true,
          fileName: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const analyses = [
      ...resumes.map((r) => ({
        id: r.id,
        type: "resume" as const,
        title: r.targetJobTitle,
        subtitle: r.industry,
        score: r.overallScore,
        fileName: r.fileName,
        createdAt: r.createdAt,
      })),
      ...contracts.map((c) => ({
        id: c.id,
        type: "contract" as const,
        title: c.clientPosition,
        subtitle: c.industryType,
        riskLevel: c.riskLevel,
        fileName: c.fileName,
        createdAt: c.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Error fetching recent analyses:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
