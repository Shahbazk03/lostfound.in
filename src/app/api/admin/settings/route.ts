import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { organizationSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await db
      .select()
      .from(organizationSettings)
      .limit(1);

    return NextResponse.json({ 
      settings: settings[0] || null 
    });
  } catch (error) {
    console.error("Get settings error:", error);
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

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    const {
      organizationName,
      description,
      contactEmail,
      contactPhone,
      address,
      city,
      country,
      supportEmail,
      supportPhone,
      timezone,
      currency,
    } = body;

    if (!organizationName || !contactEmail) {
      return NextResponse.json(
        { error: "Organization name and contact email are required" },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await db
      .select()
      .from(organizationSettings)
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing
      result = await db
        .update(organizationSettings)
        .set({
          organizationName,
          description,
          contactEmail,
          contactPhone,
          address,
          city,
          country,
          supportEmail,
          supportPhone,
          timezone,
          currency,
          updatedAt: new Date(),
        })
        .returning();
    } else {
      // Create new
      result = await db
        .insert(organizationSettings)
        .values({
          organizationName,
          description,
          contactEmail,
          contactPhone,
          address,
          city,
          country,
          supportEmail,
          supportPhone,
          timezone: timezone || "UTC",
          currency: currency || "USD",
        })
        .returning();
    }

    return NextResponse.json({ settings: result[0] });
  } catch (error) {
    console.error("Update settings error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
