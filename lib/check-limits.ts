import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const PLAN_LIMITS: Record<string, { limit: number; period: "total" | "monthly" }> = {
  free: { limit: 3, period: "total" },
  basic: { limit: 5, period: "monthly" },
  pro: { limit: Infinity, period: "monthly" },
  enterprise: { limit: Infinity, period: "monthly" },
  api: { limit: Infinity, period: "monthly" },
};

export async function checkAnalysisLimit(userId: string): Promise<{ allowed: boolean; remaining: number; error?: NextResponse }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, analysisCount: true, analysisResetDate: true, isBlocked: true },
  });

  if (!user) {
    return { allowed: false, remaining: 0, error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  if (user.isBlocked) {
    return { allowed: false, remaining: 0, error: NextResponse.json({ error: "Account is blocked" }, { status: 403 }) };
  }

  // Check subscription expiry for paid plans
  if (user.plan !== "free") {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { endDate: true },
    });

    if (subscription?.endDate && new Date(subscription.endDate) < new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "free" },
      });
      await prisma.subscription.updateMany({
        where: { userId, status: "active" },
        data: { status: "expired" },
      });
      return {
        allowed: false,
        remaining: 0,
        error: NextResponse.json(
          { error: "Subscription expired", message: "Ваша подписка истекла. Пожалуйста, продлите тариф." },
          { status: 429 }
        ),
      };
    }
  }

  const planConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

  if (planConfig.limit === Infinity) {
    return { allowed: true, remaining: Infinity };
  }

  let currentCount = user.analysisCount;

  if (planConfig.period === "monthly" && user.analysisResetDate) {
    const now = new Date();
    const resetDate = new Date(user.analysisResetDate);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      await prisma.user.update({
        where: { id: userId },
        data: { analysisCount: 0, analysisResetDate: now },
      });
      currentCount = 0;
    }
  }

  const remaining = planConfig.limit - currentCount;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      error: NextResponse.json(
        {
          error: "Analysis limit reached",
          plan: user.plan,
          limit: planConfig.limit,
          period: planConfig.period,
          message: user.plan === "free"
            ? "You have used all 3 free analyses. Please upgrade your plan."
            : `You have reached your monthly limit of ${planConfig.limit} analyses. Please upgrade your plan.`,
        },
        { status: 429 }
      ),
    };
  }

  return { allowed: true, remaining };
}

export async function incrementAnalysisCount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { analysisResetDate: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      analysisCount: { increment: 1 },
      analysisResetDate: user?.analysisResetDate || new Date(),
    },
  });
}
