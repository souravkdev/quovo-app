"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import LandingPage from "@/components/LandingPage";

const AUTH_PAGES = ["/signin", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/me/`,
          {
            credentials: "include",
          }
        );
        setLoggedIn(res.ok);
      } catch {
        setLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  // Show nothing while checking auth
  if (loggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Logged-out experience
  if (!loggedIn) {
    // Marketing landing for home page
    if (pathname === "/" || pathname === null) {
      return <LandingPage />;
    }

    // Auth and other public pages render their own layouts
    if (AUTH_PAGES.includes(pathname)) {
      return <>{children}</>;
    }

    // Fallback: show landing for other unknown public routes
    return <LandingPage />;
  }

  // Logged-in app layout
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">{children}</main>
      </div>
    </>
  );
}
