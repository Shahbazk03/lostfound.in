"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  User,
  Lock,
  CreditCard,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ImageIcon,
  CheckCircle,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ItemDetail {
  id: number;
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  approximateLocation: string;
  preciseLocation: string | null;
  city: string | null;
  country: string | null;
  dateLostFound: string;
  timeframe: string | null;
  photos: string[] | null;
  status: string;
  createdAt: string;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
}

function ItemDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const itemId = params.id as string;
  const unlockedParam = searchParams.get("unlocked");

  useEffect(() => {
    if (unlockedParam === "true") {
      setHasUnlocked(true);
    }
  }, [unlockedParam]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${itemId}`);
        const data = await res.json();
        if (res.ok) {
          setItem(data.item);
          setHasUnlocked(data.hasUnlocked);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleUnlock = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: parseInt(itemId) }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !item || !messageContent.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: item.userId,
          itemId: item.id,
          content: messageContent.trim(),
        }),
      });
      if (res.ok) {
        setMessageContent("");
        setShowMessageModal(false);
      }
    } catch {
      // ignore
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Item not found
          </h2>
          <Link
            href="/browse"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === item.userId;
  const canSeePrecise = isOwner || hasUnlocked || user?.role === "admin";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {item.photos && item.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {item.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(photo)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden ${
                        idx === 0 ? "col-span-2" : ""
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`${item.title} ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="aspect-[16/9] flex items-center justify-center bg-slate-100">
                  <ImageIcon className="w-16 h-16 text-slate-300" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.type === "lost"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.type === "lost" ? "Lost" : "Found"}
                    </span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {item.title}
                  </h1>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed mb-6">
                {item.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs text-slate-500">Approximate Location</div>
                    <div className="text-sm font-medium text-slate-900">
                      {item.approximateLocation}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs text-slate-500">Date</div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatDate(item.dateLostFound)}
                    </div>
                  </div>
                </div>

                {item.timeframe && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs text-slate-500">Timeframe</div>
                      <div className="text-sm font-medium text-slate-900">
                        {item.timeframe}
                      </div>
                    </div>
                  </div>
                )}

                {item.city && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Tag className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs text-slate-500">City</div>
                      <div className="text-sm font-medium text-slate-900">
                        {item.city}
                        {item.country && `, ${item.country}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Precise Location */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Precise Location
              </h2>
              {canSeePrecise && item.preciseLocation ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-emerald-900">
                      Location Unlocked
                    </div>
                    <div className="text-sm text-emerald-700 mt-1">
                      {item.preciseLocation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Unlock precise location
                      </div>
                      <div className="text-xs text-slate-500">
                        Get the exact address and GPS coordinates
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleUnlock}
                    disabled={paymentLoading}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Unlock for $1.00
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Poster Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Posted By
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">
                    {item.userName || "Anonymous"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Posted {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={() => {
                    if (!user) {
                      router.push("/login");
                      return;
                    }
                    setShowMessageModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-3">
                Safety Tips
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Meet in a public place
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Bring a friend if possible
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Verify the item before exchanging
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Trust your instincts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Send Message
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Send a message to {item.userName} about &quot;{item.title}&quot;
            </p>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Write your message here..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sendingMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function ItemDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <ItemDetailContent />
    </Suspense>
  );
}
