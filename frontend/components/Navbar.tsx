"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/users/me/");
        setLoggedIn(res.status === 200);
      } catch {
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Hide navbar in dashboard and app areas (sidebar is there)
  if (loggedIn && (pathname?.startsWith("/dashboard") || pathname?.startsWith("/brief") || pathname?.startsWith("/ai") || pathname?.startsWith("/pricing") || pathname?.startsWith("/settings"))) {
    return null;
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-medium tracking-tight text-white">
        qu<span className="text-indigo-500">o</span>vo
      </Link>

      <div className="flex items-center gap-4">
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white">
              Pricing
            </Link>
            <Link
              href="/signin"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}