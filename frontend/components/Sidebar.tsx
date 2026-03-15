"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  plan: "free" | "pro" | "agency";
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  plans: ("free" | "pro" | "agency")[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me/");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const navigationItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      plans: ["free", "pro", "agency"],
    },
    {
      name: "New Brief",
      href: "/brief/new",
      icon: FileText,
      plans: ["free", "pro", "agency"],
    },
    {
      name: "AI Chat",
      href: "/ai/chat",
      icon: MessageSquare,
      badge: "NEW",
      plans: ["pro", "agency"],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      plans: ["pro", "agency"],
    },
    {
      name: "Team",
      href: "/team",
      icon: Sparkles,
      plans: ["agency"],
    },
    {
      name: "Integrations",
      href: "/integrations",
      icon: Zap,
      plans: ["agency"],
    },
  ];

  const filteredNavItems = navigationItems.filter(
    (item) => !user || item.plans.includes(user.plan)
  );

  const handleLogout = async () => {
    try {
      await api.post("/users/logout/");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.push("/signin");
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "agency":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/30";
      case "pro":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "agency":
        return <Crown className="w-4 h-4" />;
      case "pro":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-slate-900 text-white p-2 rounded-lg border border-slate-800"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 z-50 flex flex-col transition-all duration-300",
          isOpen ? "w-64" : "w-0 md:w-64",
          "md:w-64 md:translate-x-0",
          isOpen && "md:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            <span className="text-white">qu</span>
            <span className="text-indigo-500">o</span>
            <span className="text-white">vo</span>
          </Link>
        </div>

        {/* Profile Section - Top */}
        {loading ? (
          // Loading Placeholder
          <div className="px-4 py-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="w-12 h-12 rounded-lg bg-slate-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700 rounded w-24 animate-pulse" />
                <div className="h-2 bg-slate-700 rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="px-4 py-4 border-b border-slate-800 flex-shrink-0">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden text-lg">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white">{user.name?.charAt(0).toUpperCase() || "?"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-400">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.plan === "agency" ? "👑 Agency" : user.plan === "pro" ? "⚡ Pro" : "📦 Free"}
                </p>
              </div>
            </Link>
          </div>
        ) : null}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-slate-800 px-3 py-4 space-y-1">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-indigo-600/10 text-indigo-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>
          <Link
            href="/help"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span>Help</span>
          </Link>
        </div>

        {/* User Profile Section - Bottom */}
        {user && (
          <div className="border-t border-slate-800 p-4 flex-shrink-0">
            {/* User Info Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase() || "?"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.email || "No email"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform flex-shrink-0",
                  showUserMenu && "rotate-180"
                )}
              />
            </button>

            {/* Sign Out - Direct Button (Always visible) */}
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-24 left-4 right-4 bg-slate-900 rounded-lg border border-slate-800 shadow-lg overflow-hidden z-20">
                {/* Plan Badge */}
                <div className="px-3 py-2 border-b border-slate-800">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium",
                      getPlanBadgeColor(user.plan)
                    )}
                  >
                    {getPlanIcon(user.plan)}
                    <span className="capitalize">{user.plan} Plan</span>
                  </div>
                </div>

                {/* Menu Items */}
                <Link
                  href="/profile"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800"
                >
                  👤 View Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800"
                >
                  ⚙️ Account Settings
                </Link>

                {/* Plan-specific items */}
                {user.plan !== "pro" && user.plan !== "agency" && (
                  <Link
                    href="/pricing"
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsOpen(false);
                    }}
                    className="block px-3 py-2 text-sm text-indigo-400 hover:bg-slate-800 transition-colors border-b border-slate-800 font-medium"
                  >
                    ⭐ Upgrade to Pro
                  </Link>
                )}

                {user.plan !== "agency" && (
                  <Link
                    href="/pricing"
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsOpen(false);
                    }}
                    className="block px-3 py-2 text-sm text-purple-400 hover:bg-slate-800 transition-colors font-medium"
                  >
                    👑 Agency Plan
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
