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

    const [resumeCount, contractCount, user] = await Promise.all([
      prisma.resumeAnalysis.count({ where: { userId: session.user.id } }),
      prisma.contractAnalysis.count({ where: { userId: session.user.id } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, analysisCount: true, analysisResetDate: true },
      }),
    ]);

    const PLAN_LIMITS: Record<string, { limit: number; period: string }> = {
      free: { limit: 3, period: "total" },
      basic: { limit: 5, period: "monthly" },
      pro: { limit: -1, period: "monthly" },
      enterprise: { limit: -1, period: "monthly" },
      api: { limit: -1, period: "monthly" },
    };

    const plan = user?.plan || "free";
    const planConfig = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const used = user?.analysisCount || 0;
    const limit = planConfig.limit;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

    return NextResponse.json({
      resume: resumeCount,
      contract: contractCount,
      plan,
      limit,
      used,
      remaining,
      period: planConfig.period,
    });
  } catch (error) {
    console.error("Error fetching analyses summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
