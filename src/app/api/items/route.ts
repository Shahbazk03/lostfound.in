import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status") || "active";

    const conditions = [eq(items.status, status as "active" | "resolved" | "archived")];

    if (type) conditions.push(eq(items.type, type as "lost" | "found"));
    if (category) conditions.push(eq(items.category, category));
    if (city) conditions.push(ilike(items.city, `%${city}%`));
    if (country) conditions.push(eq(items.country, country));
    if (dateFrom) {
      conditions.push(sql`${items.dateLostFound} >= ${new Date(dateFrom)}`);
    }
    if (dateTo) {
      conditions.push(sql`${items.dateLostFound} <= ${new Date(dateTo)}`);
    }
    if (query) {
      conditions.push(
        or(
          ilike(items.title, `%${query}%`),
          ilike(items.description, `%${query}%`),
          ilike(items.approximateLocation, `%${query}%`)
        )!
      );
    }

    const results = await db
      .select({
        id: items.id,
        type: items.type,
        title: items.title,
        description: items.description,
        category: items.category,
        approximateLocation: items.approximateLocation,
        city: items.city,
        country: items.country,
        dateLostFound: items.dateLostFound,
        timeframe: items.timeframe,
        photos: items.photos,
        status: items.status,
        createdAt: items.createdAt,
        userId: items.userId,
        userName: users.name,
      })
      .from(items)
      .leftJoin(users, eq(items.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(items.createdAt));

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      type,
      title,
      description,
      category,
      approximateLocation,
      preciseLocation,
      city,
      country,
      dateLostFound,
      timeframe,
      photos,
    } = body;

    if (!type || !title || !description || !category || !approximateLocation || !dateLostFound) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newItem = await db
      .insert(items)
      .values({
        userId: user.id,
        type,
        title,
        description,
        category,
        approximateLocation,
        preciseLocation: preciseLocation || null,
        city: city || null,
        country: country || null,
        dateLostFound: new Date(dateLostFound),
        timeframe: timeframe || null,
        photos: photos || [],
      })
      .returning();

    return NextResponse.json({ item: newItem[0] });
  } catch (error) {
    console.error("Create item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
