import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, users, payments } from "@/db/schema";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    const user = await getCurrentUser();

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
        timeframe: items.timeframe,
        photos: items.photos,
        status: items.status,
        createdAt: items.createdAt,
        userId: items.userId,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(items)
      .leftJoin(users, eq(items.userId, users.id))
      .where(eq(items.id, itemId))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = results[0];

    // Check if user has paid for precise location
    let hasUnlocked = false;
    if (user) {
      if (item.userId === user.id || user.role === "admin") {
        hasUnlocked = true;
      } else {
        const paymentRecord = await db
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
        hasUnlocked = paymentRecord.length > 0;
      }
    }

    // Hide precise location if not unlocked
    if (!hasUnlocked) {
      (item as Record<string, unknown>).preciseLocation = null;
    }

    return NextResponse.json({ item, hasUnlocked });
  } catch (error) {
    console.error("Get item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    const user = await requireAuth();
    const body = await request.json();

    const existingItem = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem[0].userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.photos) updateData.photos = body.photos;

    const updated = await db
      .update(items)
      .set(updateData)
      .where(eq(items.id, itemId))
      .returning();

    return NextResponse.json({ item: updated[0] });
  } catch (error) {
    console.error("Update item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    const user = await requireAuth();

    const existingItem = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem[0].userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(items).where(eq(items.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
