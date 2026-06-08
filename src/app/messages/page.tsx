"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  Send,
  ArrowLeft,
  User,
  Lock,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  read: boolean;
  createdAt: string;
  senderId: number;
  senderName: string | null;
  receiverId: number;
  itemId: number;
  itemTitle: string | null;
  isLocked?: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [unlockingMessageId, setUnlockingMessageId] = useState<number | null>(null);
  const [unlockedMessages, setUnlockedMessages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = `${msg.itemId}-${
      msg.senderId === user?.id ? msg.receiverId : msg.senderId
    }`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedItemId || !user) return;
    const conversation = groupedMessages[Object.keys(groupedMessages).find((k) =>
      k.startsWith(`${selectedItemId}-`)
    ) || ""];
    if (!conversation) return;

    const otherUserId = conversation[0].senderId === user.id
      ? conversation[0].receiverId
      : conversation[0].senderId;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          itemId: selectedItemId,
          content: replyContent.trim(),
        }),
      });
      if (res.ok) {
        setReplyContent("");
        fetchMessages();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleUnlockMessage = async (messageId: number) => {
    if (!user) return;
    
    setUnlockingMessageId(messageId);
    try {
      const res = await fetch("/api/messages/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: messageId,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.sessionUrl) {
          // Redirect to Stripe checkout
          window.location.href = data.sessionUrl;
        }
      }
    } catch (error) {
      console.error("Error unlocking message:", error);
    } finally {
      setUnlockingMessageId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Sign in required
          </h2>
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const selectedConversation = selectedItemId
    ? groupedMessages[
        Object.keys(groupedMessages).find((k) =>
          k.startsWith(`${selectedItemId}-`)
        ) || ""
      ]
    : null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Messages</h1>
          <p className="text-slate-600">
            Communicate with finders and owners
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No messages yet
            </h3>
            <p className="text-slate-600">
              Messages will appear here when someone contacts you
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Conversations</h2>
              </div>
              <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedMessages).map(([key, msgs]) => {
                  const lastMsg = msgs[msgs.length - 1];
                  const isSelected = selectedItemId === lastMsg.itemId;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedItemId(lastMsg.itemId)}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-emerald-50 border-l-4 border-emerald-500" : ""
                      }`}
                    >
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {lastMsg.itemTitle || "Unknown Item"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {lastMsg.senderName}: {lastMsg.content}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDateTime(lastMsg.createdAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[600px]">
                  <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedItemId(null)}
                      className="lg:hidden text-slate-400 hover:text-slate-600"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-900">
                        {selectedConversation[0].itemTitle || "Unknown Item"}
                      </div>
                      <Link
                        href={`/items/${selectedConversation[0].itemId}`}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        View Item
                      </Link>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {[...selectedConversation].reverse().map((msg) => {
                      const isMe = msg.senderId === user.id;
                      const isUnlocked = !msg.isLocked || unlockedMessages.has(msg.id);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.isLocked && !isUnlocked ? (
                            <div
                              className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                                isMe
                                  ? "bg-emerald-600 rounded-br-md"
                                  : "bg-slate-100 rounded-bl-md"
                              }`}
                            >
                              <div
                                className={`flex items-center gap-2 ${
                                  isMe ? "text-white" : "text-slate-700"
                                }`}
                              >
                                <Lock className="w-4 h-4" />
                                <span className="font-medium">Message locked</span>
                              </div>
                              <p
                                className={`text-xs mt-2 ${
                                  isMe ? "text-emerald-100" : "text-slate-500"
                                }`}
                              >
                                Unlock for $1 to view this message
                              </p>
                              {!isMe && (
                                <button
                                  onClick={() => handleUnlockMessage(msg.id)}
                                  disabled={unlockingMessageId === msg.id}
                                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 w-full justify-center"
                                >
                                  {unlockingMessageId === msg.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3" />
                                      Unlock for $1
                                    </>
                                  )}
                                </button>
                              )}
                              <div
                                className={`text-xs mt-2 ${
                                  isMe ? "text-emerald-200" : "text-slate-400"
                                }`}
                              >
                                {formatDateTime(msg.createdAt)}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                isMe
                                  ? "bg-emerald-600 text-white rounded-br-md"
                                  : "bg-slate-100 text-slate-700 rounded-bl-md"
                              }`}
                            >
                              <div>{msg.content}</div>
                              <div
                                className={`text-xs mt-1 ${
                                  isMe ? "text-emerald-200" : "text-slate-400"
                                }`}
                              >
                                {formatDateTime(msg.createdAt)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-5 py-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim() || sending}
                        className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">
                      Select a conversation to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
