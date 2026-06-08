import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, items } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { stripe, PREMIUM_AMOUNT } from "@/lib/stripe";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const item = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if already paid
    const existingPayment = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, user.id),
          eq(payments.itemId, itemId),
          eq(payments.status, "completed")
        )
      )
      .limit(1);

    if (existingPayment.length > 0) {
      return NextResponse.json(
        { error: "Already unlocked" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Unlock Precise Location: ${item[0].title}`,
              description: `Get the exact location details for this ${item[0].type} item`,
            },
            unit_amount: PREMIUM_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/items/${itemId}?unlocked=true`,
      cancel_url: `${baseUrl}/items/${itemId}?unlocked=false`,
      metadata: {
        userId: String(user.id),
        itemId: String(itemId),
      },
    });

    await db.insert(payments).values({
      userId: user.id,
      itemId,
      amount: PREMIUM_AMOUNT,
      status: "pending",
      stripeSessionId: session.id,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Payment creation error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
