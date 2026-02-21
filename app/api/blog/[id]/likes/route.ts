import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const count = await prisma.blogLike.count({ where: { postId: params.id } });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const existing = await prisma.blogLike.findUnique({
      where: { postId_sessionId: { postId: params.id, sessionId } },
    });

    if (existing) {
      await prisma.blogLike.delete({ where: { id: existing.id } });
      const count = await prisma.blogLike.count({ where: { postId: params.id } });
      return NextResponse.json({ liked: false, count });
    }

    await prisma.blogLike.create({ data: { postId: params.id, sessionId } });
    const count = await prisma.blogLike.count({ where: { postId: params.id } });
    return NextResponse.json({ liked: true, count });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
