"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function NewBrief() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    client_message: "",
    freelancer_type: "",
    hourly_rate: 0,
    extra_context: "",
  });

  // Check auth on mount
  useEffect(() => {
    setIsClient(true);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourly_rate" ? (value ? parseInt(value) : "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form
    if (!formData.client_message.trim()) {
      setError("Client message is required");
      setLoading(false);
      return;
    }
    if (!formData.freelancer_type.trim()) {
      setError("Freelancer type is required");
      setLoading(false);
      return;
    }
    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      setError("Valid hourly rate is required");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/briefs/generate/", {
        client_message: formData.client_message,
        freelancer_type: formData.freelancer_type,
        hourly_rate: formData.hourly_rate,
        extra_context: formData.extra_context || "",
      });

      // Redirect to the generated brief
      const briefSlug = response.data.brief.slug;
      router.push(`/brief/${briefSlug}`);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate brief. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create a New Brief</h1>
          <p className="text-gray-400">
            Paste your client's message and we'll generate a professional project brief instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-lg border border-slate-800 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Client Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Client Message <span className="text-red-400">*</span>
            </label>
            <textarea
              name="client_message"
              value={formData.client_message}
              onChange={handleChange}
              disabled={loading}
              placeholder="Paste your client's message here... (email, WhatsApp, DM, etc.)"
              className="w-full h-32 px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 disabled:opacity-50"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Be as detailed as possible. Include all client requirements and context.
            </p>
          </div>

          {/* Freelancer Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Your Freelancer Type <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="freelancer_type"
              value={formData.freelancer_type}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Web Developer, UI/UX Designer, Content Writer"
              className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 disabled:opacity-50"
              required
            />
          </div>

          {/* Hourly Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Hourly Rate (USD) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., 75"
              min="1"
              className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 disabled:opacity-50"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Used to estimate project costs in the brief.
            </p>
          </div>

          {/* Extra Context */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white mb-2">
              Extra Context <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              name="extra_context"
              value={formData.extra_context}
              onChange={handleChange}
              disabled={loading}
              placeholder="Any additional context about your process, skills, or project specifics..."
              className="w-full h-24 px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating your brief...
              </span>
            ) : (
              "Generate Brief"
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Free plan: <strong>5 briefs per month</strong> • Pro plan: <strong>Unlimited briefs</strong>
          </p>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
