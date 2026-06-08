import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_test"
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; metadata?: Record<string, string> };
      const stripeSessionId = session.id;

      await db
        .update(payments)
        .set({ status: "completed" })
        .where(eq(payments.stripeSessionId, stripeSessionId));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
