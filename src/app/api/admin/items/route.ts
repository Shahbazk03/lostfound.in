import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions = [];
    if (status) conditions.push(eq(items.status, status as "active" | "resolved" | "archived"));

    const results = await db
      .select({
        id: items.id,
        type: items.type,
        title: items.title,
        description: items.description,
        category: items.category,
        approximateLocation: items.approximateLocation,
        preciseLocation: items.preciseLocation,
        city: items.city,
        country: items.country,
        dateLostFound: items.dateLostFound,
        status: items.status,
        createdAt: items.createdAt,
        userId: items.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(items)
      .leftJoin(users, eq(items.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(items.createdAt));

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error("Get admin items error:", error);
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
