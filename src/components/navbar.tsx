"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  PlusCircle,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Reunite</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/browse"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Browse Items
              </Link>
              <Link
                href="/report"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Report Item
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <span className="text-sm text-slate-700 font-medium">
                    {user.name}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center"
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/browse"
              className="block py-2 text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              Browse Items
            </Link>
            <Link
              href="/report"
              className="block py-2 text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              Report Item
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-sm font-medium text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  className="block py-2 text-sm font-medium text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Messages
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block py-2 text-sm font-medium text-slate-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="block py-2 text-sm font-medium text-red-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-sm font-medium text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-sm font-medium text-emerald-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
