import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, items } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc, and, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      const results = await db
        .select({
          id: messages.id,
          content: messages.content,
          read: messages.read,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          senderName: users.name,
          receiverId: messages.receiverId,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.itemId, parseInt(itemId)))
        .orderBy(desc(messages.createdAt));

      return NextResponse.json({ messages: results });
    }

    // Get all conversations for user
    const results = await db
      .select({
        id: messages.id,
        content: messages.content,
        read: messages.read,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        receiverId: messages.receiverId,
        itemId: messages.itemId,
        itemTitle: items.title,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(items, eq(messages.itemId, items.id))
      .where(
        or(
          eq(messages.senderId, user.id),
          eq(messages.receiverId, user.id)
        )
      )
      .orderBy(desc(messages.createdAt));

    return NextResponse.json({ messages: results });
  } catch (error) {
    console.error("Get messages error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
    const { receiverId, itemId, content } = body;

    if (!receiverId || !itemId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMessage = await db
      .insert(messages)
      .values({
        senderId: user.id,
        receiverId: parseInt(receiverId),
        itemId: parseInt(itemId),
        content,
      })
      .returning();

    return NextResponse.json({ message: newMessage[0] });
  } catch (error) {
    console.error("Create message error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
