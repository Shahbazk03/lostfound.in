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
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Building,
  Mail,
  Phone,
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

interface AdminMessage {
  id: number;
  content: string;
  senderName: string;
  receiverName: string;
  itemTitle: string;
  createdAt: string;
}

interface OrganizationSettings {
  id?: number;
  organizationName: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  supportEmail?: string;
  supportPhone?: string;
  timezone?: string;
  currency?: string;
}

type TabType = "overview" | "users" | "items" | "messages" | "payments" | "settings";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [editingSettings, setEditingSettings] = useState<OrganizationSettings | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

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
      const [statsRes, usersRes, itemsRes, messagesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/items"),
        fetch("/api/admin/messages"),
        fetch("/api/admin/settings"),
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
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages);
      }
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings);
      }
    } catch {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? editingUser : u))
          );
          setEditingUser(null);
        }
      } catch (error) {
        console.error("Error saving user:", error);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [...prev, data.user]);
        setNewUser({ name: "", email: "", password: "" });
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Item Management Functions
  const handleSaveItem = async () => {
    if (editingItem) {
      try {
        const res = await fetch(`/api/admin/items/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        });
        if (res.ok) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingItem.id ? editingItem : i))
          );
          setEditingItem(null);
        }
      } catch (error) {
        console.error("Error saving item:", error);
      }
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const res = await fetch(`/api/admin/items/${itemId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  // Settings Management Functions
  const handleSaveSettings = async () => {
    if (!editingSettings) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setEditingSettings(null);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
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

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "items", label: "Items", icon: Package },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          </div>
          <p className="text-slate-600">
            Complete platform management and administration
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
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
                  {[
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "emerald" },
                    { label: "Total Items", value: stats.totalItems, icon: Package, color: "blue" },
                    { label: "Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "amber" },
                    { label: "Transactions", value: stats.totalTransactions, icon: CheckCircle, color: "purple" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${color}-600`} />
                        </div>
                        <div className="text-sm text-slate-500">{label}</div>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">Users Management</h2>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>

                {/* Add User Modal */}
                {showUserModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Add New User</h3>
                        <button onClick={() => setShowUserModal(false)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleCreateUser}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                          >
                            Create User
                          </button>
                          <button
                            onClick={() => setShowUserModal(false)}
                            className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.phone || "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
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
                          <td className="px-6 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Edit User</h3>
                        <button onClick={() => setEditingUser(null)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                          <input
                            type="text"
                            value={editingUser.phone || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value || null })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingUser.verified}
                              onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-slate-700">Verified</span>
                          </label>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleSaveUser}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === "items" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">All Items ({items.length})</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Posted By</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium max-w-xs truncate">{item.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            item.type === "lost"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                            item.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.status === "resolved"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.approximateLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.userName || "Unknown"}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Edit Item Modal */}
                {editingItem && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Edit Item</h3>
                        <button onClick={() => setEditingItem(null)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={editingItem.title}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                          <textarea
                            value={editingItem.description}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                          <select
                            value={editingItem.status}
                            onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleSaveItem}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">All Messages ({messages.length})</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">From</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">To</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Content</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {messages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{msg.senderName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{msg.receiverName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{msg.itemTitle}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{msg.content}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(msg.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Building className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Organization Settings</h3>
                    </div>
                    <button
                      onClick={() => setEditingSettings(settings || {})}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Settings
                    </button>
                  </div>

                  {settings ? (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Organization Name</label>
                        <p className="text-lg font-semibold text-slate-900">{settings.organizationName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Contact Email</label>
                        <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {settings.contactEmail}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Contact Phone</label>
                        <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {settings.contactPhone || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Support Email</label>
                        <p className="text-lg font-semibold text-slate-900">{settings.supportEmail || "-"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-500 mb-1">Address</label>
                        <p className="text-lg font-semibold text-slate-900">{settings.address || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">City</label>
                        <p className="text-lg font-semibold text-slate-900">{settings.city || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Country</label>
                        <p className="text-lg font-semibold text-slate-900">{settings.country || "-"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600">No settings configured yet</p>
                  )}
                </div>

                {/* Edit Settings Modal */}
                {editingSettings && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Edit Organization Settings</h3>
                        <button onClick={() => setEditingSettings(null)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                          <input
                            type="text"
                            value={editingSettings.organizationName}
                            onChange={(e) => setEditingSettings({ ...editingSettings, organizationName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                          <textarea
                            value={editingSettings.description || ""}
                            onChange={(e) => setEditingSettings({ ...editingSettings, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            rows={3}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                            <input
                              type="email"
                              value={editingSettings.contactEmail}
                              onChange={(e) => setEditingSettings({ ...editingSettings, contactEmail: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                            <input
                              type="text"
                              value={editingSettings.contactPhone || ""}
                              onChange={(e) => setEditingSettings({ ...editingSettings, contactPhone: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                            <input
                              type="email"
                              value={editingSettings.supportEmail || ""}
                              onChange={(e) => setEditingSettings({ ...editingSettings, supportEmail: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone</label>
                            <input
                              type="text"
                              value={editingSettings.supportPhone || ""}
                              onChange={(e) => setEditingSettings({ ...editingSettings, supportPhone: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                          <input
                            type="text"
                            value={editingSettings.address || ""}
                            onChange={(e) => setEditingSettings({ ...editingSettings, address: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input
                              type="text"
                              value={editingSettings.city || ""}
                              onChange={(e) => setEditingSettings({ ...editingSettings, city: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                            <input
                              type="text"
                              value={editingSettings.country || ""}
                              onChange={(e) => setEditingSettings({ ...editingSettings, country: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleSaveSettings}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Settings
                          </button>
                          <button
                            onClick={() => setEditingSettings(null)}
                            className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
