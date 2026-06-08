import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { organizationSettings } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the first organization settings (there should only be one)
    const settings = await db
      .select()
      .from(organizationSettings)
      .limit(1);

    if (settings.length === 0) {
      // Create default settings if none exist
      const defaultSettings = await db
        .insert(organizationSettings)
        .values({
          organizationName: "Global Lost and Found Platform",
          contactEmail: "contact@example.com",
          timezone: "UTC",
          currency: "USD",
        })
        .returning();

      return NextResponse.json(defaultSettings[0]);
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error("Error fetching organization settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Get existing settings
    const existing = await db
      .select()
      .from(organizationSettings)
      .limit(1);

    if (existing.length === 0) {
      // Create new settings
      const newSettings = await db
        .insert(organizationSettings)
        .values(body)
        .returning();

      return NextResponse.json(newSettings[0]);
    }

    // Update existing settings
    const updated = await db
      .update(organizationSettings)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(organizationSettings.id, existing[0].id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating organization settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
