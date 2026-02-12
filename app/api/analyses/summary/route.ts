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

    const resumeCount = await prisma.resumeAnalysis.count({
      where: { userId: session.user.id },
    });

    const contractCount = await prisma.contractAnalysis.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      resume: resumeCount,
      contract: contractCount,
    });
  } catch (error) {
    console.error("Error fetching analyses summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
