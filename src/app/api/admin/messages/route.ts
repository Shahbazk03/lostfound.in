import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, items } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
    const results = await db
      .select({
        id: messages.id,
        content: messages.content,
        senderName: users.name,
        receiverName: users.name,
        itemTitle: items.title,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .leftJoin(users, (u) => u.id)
      .leftJoin(items, (i) => i.id)
      .orderBy(desc(messages.createdAt))
      .limit(100);

    return NextResponse.json({ messages: results });
  } catch (error) {
    console.error("Get messages error:", error);
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
