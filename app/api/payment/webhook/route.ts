import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { notifyAdmin, paymentNotificationEmail } from "@/lib/notify";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover",
  });
}

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      // Update user plan
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: plan,
          analysisCount: 0,
          analysisResetDate: new Date(),
        },
      });

      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: "active",
          paymentMethod: "stripe",
          paymentId: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      const { subject, html } = paymentNotificationEmail({
        userName: session.customer_details?.name || "Unknown",
        userEmail: session.customer_details?.email || "",
        plan,
        amount: (session.amount_total || 0) / 100,
        method: "Stripe",
      });
      notifyAdmin(subject, html);
    }
  }

  return NextResponse.json({ received: true });
}
