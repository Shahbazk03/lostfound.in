"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Users,
  Package,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalItems: number;
  totalRevenue: number;
  totalTransactions: number;
  itemsByType: { type: string; count: number }[];
  itemsByStatus: { status: string; count: number }[];
  recentItems: {
    id: number;
    title: string;
    type: string;
    status: string;
    createdAt: string;
  }[];
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  verified: boolean;
  createdAt: string;
}

interface AdminItem {
  id: number;
  type: string;
  title: string;
  description: string;
  category: string;
  approximateLocation: string;
  preciseLocation: string | null;
  city: string | null;
  country: string | null;
  dateLostFound: string;
  status: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "items">(
    "overview"
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/items"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData.items);
      }
    } catch {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserVerified = async (userId: number, verified: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verified: !verified }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, verified: !verified } : u
          )
        );
      }
    } catch {
      // ignore
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600">
            You don&apos;t have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          </div>
          <p className="text-slate-600">
            Manage listings, users, and platform analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "overview" as const, label: "Overview", icon: BarChart3 },
            { id: "users" as const, label: "Users", icon: Users },
            { id: "items" as const, label: "Items", icon: Package },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-sm text-slate-500">Total Users</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalUsers}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-sm text-slate-500">Total Items</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalItems}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="text-sm text-slate-500">Revenue</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-sm text-slate-500">
                        Transactions
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalTransactions}
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Items by Type
                    </h3>
                    <div className="space-y-3">
                      {stats.itemsByType.map(({ type, count }) => (
                        <div key={type} className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              type === "lost"
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <div className="flex-1 text-sm text-slate-600 capitalize">
                            {type}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Items by Status
                    </h3>
                    <div className="space-y-3">
                      {stats.itemsByStatus.map(({ status, count }) => (
                        <div key={status} className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              status === "active"
                                ? "bg-emerald-500"
                                : status === "resolved"
                                ? "bg-blue-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <div className="flex-1 text-sm text-slate-600 capitalize">
                            {status}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">
                      Recent Listings
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {stats.recentItems.map((item) => (
                      <div
                        key={item.id}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-900 text-sm">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.type === "lost"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                              item.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "resolved"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">
                    All Users ({users.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Name
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Email
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Role
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Verified
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Joined
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                            {u.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.verified ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                toggleUserVerified(u.id, u.verified)
                              }
                              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <UserCheck className="w-4 h-4" />
                              {u.verified ? "Unverify" : "Verify"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Items Tab */}
            {activeTab === "items" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">
                    All Items ({items.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Title
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Type
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Category
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Location
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Posted By
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium max-w-xs truncate">
                            {item.title}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                item.type === "lost"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.approximateLocation}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                                item.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.status === "resolved"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {item.userName || "Unknown"}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`/items/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
