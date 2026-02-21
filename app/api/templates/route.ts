import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const templates = await prisma.templateDocument.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Templates fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const template = await prisma.templateDocument.create({ data });
    return NextResponse.json(template);
  } catch (error) {
    console.error("Template create error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
