"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/register/", form);
      const detail = res.data?.detail;

      if (detail === "verification_required" || res.data?.email_verified === false) {
        setVerificationPending(true);
        setVerificationEmail(res.data?.email || form.email);
        setResendCooldown(30);
        return;
      }

      // Fallback: if backend returned a verified session, go to dashboard.
      router.push("/dashboard");
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.non_field_errors?.[0] ??
        "Unable to sign up.";
      if (detail === "Email not verified") {
        setVerificationPending(true);
        setVerificationEmail(form.email);
        setResendCooldown(30);
        return;
      }

      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!verificationPending || resendCooldown <= 0) return;

    const t = window.setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => window.clearInterval(t);
  }, [verificationPending, resendCooldown]);

  async function handleResendVerification() {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setError(null);
    try {
      await api.post("/auth/resend-verification/", { email: verificationEmail });
      setResendCooldown(30);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Unable to resend verification email.";
      setError(detail);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">
            {verificationPending ? "Verify your email" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {verificationPending
              ? "An email has been sent to your inbox. Please verify your email to continue."
              : "Start generating professional briefs in minutes."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {verificationPending ? (
          <div className="text-sm text-slate-300 space-y-4">
            <p>
              Verification email sent to <span className="font-medium">{verificationEmail}</span>. Please check your inbox
              and click the verification link.
            </p>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending || resendCooldown > 0}
              className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white py-2.5"
            >
              {resending
                ? "Sending…"
                : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend verification email"}
            </button>

            <div className="pt-2 text-xs text-slate-400">
              Didn&apos;t receive the email? Check your spam folder.
            </div>

            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors text-sm font-medium text-slate-100 py-2.5"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input
                type="text"
                autoComplete="name"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white py-2.5"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          {!verificationPending && (
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="hover:text-slate-200 transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

