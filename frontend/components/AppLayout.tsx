"use client";

import { useState, useEffect } from "react";
import { isLoggedIn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import LandingPage from "@/components/LandingPage";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
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

  // Show landing page if not logged in
  if (!loggedIn) {
    return <LandingPage />;
  }

  // Show app layout if logged in
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
