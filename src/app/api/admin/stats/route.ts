import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, items, payments } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();

    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalItems = await db.select({ count: sql<number>`count(*)` }).from(items);
    const totalPayments = await db
      .select({ count: sql<number>`count(*)`, amount: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(sql`${payments.status} = 'completed'`);

    const itemsByType = await db
      .select({
        type: items.type,
        count: sql<number>`count(*)`,
      })
      .from(items)
      .groupBy(items.type);

    const itemsByStatus = await db
      .select({
        status: items.status,
        count: sql<number>`count(*)`,
      })
      .from(items)
      .groupBy(items.status);

    const recentItems = await db
      .select({
        id: items.id,
        title: items.title,
        type: items.type,
        status: items.status,
        createdAt: items.createdAt,
      })
      .from(items)
      .orderBy(sql`${items.createdAt} desc`)
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers[0].count,
        totalItems: totalItems[0].count,
        totalRevenue: totalPayments[0]?.amount || 0,
        totalTransactions: totalPayments[0]?.count || 0,
        itemsByType,
        itemsByStatus,
        recentItems,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
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
