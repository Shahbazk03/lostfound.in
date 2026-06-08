import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createMessageUnlockSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Create Stripe session for $1 unlock
    const sessionUrl = await createMessageUnlockSession({
      userId: user.id,
      messageId: parseInt(messageId),
    });

    if (!sessionUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionUrl });
  } catch (error) {
    console.error("Error unlocking message:", error);
    return NextResponse.json(
      { error: "Failed to process unlock" },
      { status: 500 }
    );
  }
}
