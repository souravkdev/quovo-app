"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If logged in, redirect to dashboard
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, []);

  // Landing page is shown by AppLayout for logged-out users
  // This page is unreachable for logged-out users (landing page shown instead)
  // Logged-in users are redirected to dashboard above
  return null;
}