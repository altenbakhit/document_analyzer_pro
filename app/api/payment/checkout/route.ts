import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover",
  });
}

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  basic: { amount: 2990, name: "Basic Plan" },
  pro: { amount: 9990, name: "Pro Plan" },
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planInfo = PLAN_PRICES[plan];
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "kzt",
            product_data: {
              name: planInfo.name,
              description: `Document Analyzer Pro - ${planInfo.name}`,
            },
            unit_amount: planInfo.amount * 100, // Stripe uses smallest currency unit
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        plan: plan,
      },
      customer_email: session.user.email || undefined,
      success_url: `${origin}/pricing?success=true&plan=${plan}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
