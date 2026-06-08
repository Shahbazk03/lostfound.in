import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, users, items } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const results = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        stripeSessionId: payments.stripeSessionId,
        createdAt: payments.createdAt,
        userName: users.name,
        itemTitle: items.title,
      })
      .from(payments)
      .leftJoin(users, (u) => u.id)
      .leftJoin(items, (i) => i.id)
      .orderBy(desc(payments.createdAt));

    return NextResponse.json({ 
      payments: results.map(p => ({
        ...p,
        amountFormatted: formatCurrency(p.amount)
      }))
    });
  } catch (error) {
    console.error("Get payments error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
