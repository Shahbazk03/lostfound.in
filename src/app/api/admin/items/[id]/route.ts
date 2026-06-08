import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const itemId = parseInt(params.id);
    const body = await request.json();
    const { title, description, status, category, approximateLocation } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (category) updateData.category = category;
    if (approximateLocation) updateData.approximateLocation = approximateLocation;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(items)
      .set(updateData)
      .where(eq(items.id, itemId))
      .returning();

    return NextResponse.json({ item: updated[0] });
  } catch (error) {
    console.error("Update item error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const itemId = parseInt(params.id);

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await db.delete(items).where(eq(items.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete item error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
