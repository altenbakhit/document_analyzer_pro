import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const prisma = new PrismaClient();

function isValidApiKey(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return !!apiKey && apiKey === process.env.BLOG_API_KEY;
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Blog fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isValidApiKey(request)) {
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const data = await request.json();
    const post = await prisma.blogPost.create({ data });
    return NextResponse.json(post);
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
