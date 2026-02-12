import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      analysisCount: true,
      analysisResetDate: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      resumeAnalyses: {
        select: {
          id: true,
          targetJobTitle: true,
          industry: true,
          overallScore: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      contractAnalyses: {
        select: {
          id: true,
          clientPosition: true,
          riskLevel: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.error;

  const body = await request.json();
  const { role, plan, isBlocked, analysisCount } = body;

  const data: any = {};
  if (role !== undefined) data.role = role;
  if (plan !== undefined) data.plan = plan;
  if (isBlocked !== undefined) data.isBlocked = isBlocked;
  if (analysisCount !== undefined) data.analysisCount = analysisCount;

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      analysisCount: true,
      isBlocked: true,
    },
  });

  return NextResponse.json(user);
}
