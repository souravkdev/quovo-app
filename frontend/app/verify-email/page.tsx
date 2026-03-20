"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Missing verification token.");
        setLoading(false);
        return;
      }

      try {
        await api.post("/auth/verify-email/", { token });
        setVerified(true);
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail ?? "Unable to verify email. Token may be expired.";
        setError(detail);
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-400">
            {loading ? "Checking token..." : verified ? "Your email has been verified." : "We couldn’t verify your token."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white py-2.5"
          >
            Go to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

