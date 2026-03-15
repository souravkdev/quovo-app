"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Tokens are already stored in HttpOnly cookies by the backend.
    // We just send the user to their dashboard.
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <p className="text-sm text-slate-300">Signing you in securely…</p>
    </div>
  );
}

