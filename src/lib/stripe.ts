import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    })
  : null;

export const PREMIUM_AMOUNT = 100;
export const UNLOCK_AMOUNT = 100; // $1 in cents

export async function createMessageUnlockSession({
  userId,
  messageId,
}: {
  userId: number;
  messageId: number;
}): Promise<string | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Message Unlock",
            description: "Unlock a message for $1",
          },
          unit_amount: UNLOCK_AMOUNT,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/messages?unlock=success&messageId=${messageId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/messages?unlock=cancelled`,
    metadata: {
      userId: userId.toString(),
      messageId: messageId.toString(),
      type: "message_unlock",
    },
  });

  return session.url;
}