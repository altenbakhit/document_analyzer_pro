import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (session.user.role !== "admin") {
    return { authorized: false, error: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }) };
  }

  return { authorized: true, session };
}
