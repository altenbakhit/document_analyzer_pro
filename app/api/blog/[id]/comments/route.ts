import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.blogComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { author, content } = await request.json();
    if (!author || !content) {
      return NextResponse.json({ error: "author and content required" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    const comment = await prisma.blogComment.create({
      data: { postId: params.id, author, content },
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
