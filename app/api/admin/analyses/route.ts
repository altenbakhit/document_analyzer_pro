import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type") || "all";

  const skip = (page - 1) * limit;

  let resumes: any[] = [];
  let contracts: any[] = [];
  let totalResumes = 0;
  let totalContracts = 0;

  if (type === "all" || type === "resume") {
    [resumes, totalResumes] = await Promise.all([
      prisma.resumeAnalysis.findMany({
        select: {
          id: true,
          targetJobTitle: true,
          industry: true,
          overallScore: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: type === "resume" ? skip : 0,
        take: type === "resume" ? limit : Math.ceil(limit / 2),
      }),
      prisma.resumeAnalysis.count(),
    ]);
  }

  if (type === "all" || type === "contract") {
    [contracts, totalContracts] = await Promise.all([
      prisma.contractAnalysis.findMany({
        select: {
          id: true,
          clientPosition: true,
          riskLevel: true,
          isCrossBorder: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: type === "contract" ? skip : 0,
        take: type === "contract" ? limit : Math.ceil(limit / 2),
      }),
      prisma.contractAnalysis.count(),
    ]);
  }

  const total = type === "resume" ? totalResumes : type === "contract" ? totalContracts : totalResumes + totalContracts;

  return NextResponse.json({
    resumes: resumes.map((r) => ({ ...r, type: "resume" })),
    contracts: contracts.map((c) => ({ ...c, type: "contract" })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
