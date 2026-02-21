import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { notifyAdmin, paymentNotificationEmail } from "@/lib/notify";

const prisma = new PrismaClient();

const PLAN_PRICES: Record<string, number> = {
  basic: 2990,
  pro: 9990,
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, offerAccepted } = await request.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!offerAccepted) {
      return NextResponse.json({ error: "Offer must be accepted" }, { status: 400 });
    }

    // Create pending subscription with offer acceptance record
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan,
        status: "pending_kaspi",
        paymentMethod: "kaspi",
        amount: PLAN_PRICES[plan],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        offerAccepted: true,
        offerAcceptedAt: new Date(),
      },
    });

    const { subject, html } = paymentNotificationEmail({
      userName: session.user.name || "Unknown",
      userEmail: session.user.email || "",
      plan,
      amount: PLAN_PRICES[plan],
      method: "Kaspi QR",
    });
    notifyAdmin(subject, html);

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error) {
    console.error("Kaspi request error:", error);
    return NextResponse.json(
      { error: "Failed to create payment request" },
      { status: 500 }
    );
  }
}
