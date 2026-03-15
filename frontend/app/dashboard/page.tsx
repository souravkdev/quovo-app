"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isLoggedIn, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Brief {
  id: string;
  slug: string;
  project_title: string;
  is_approved: boolean;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (!isLoggedIn()) {
      router.push("/");
      return;
    }
    fetchBriefs();
  }, [router]);

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/briefs/");
      setBriefs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load briefs");
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/brief/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Briefs</h1>
            <p className="text-gray-400">Manage and share your project briefs with clients.</p>
          </div>
          <Link
            href="/brief/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            + New Brief
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Empty State */}
        {!loading && briefs.length === 0 && (
          <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">No Briefs Yet</h3>
            <p className="text-gray-400 mb-6">Create your first project brief to get started.</p>
            <Link
              href="/brief/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Create Your First Brief
            </Link>
          </div>
        )}

        {/* Briefs Grid */}
        {!loading && briefs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/brief/${brief.slug}`}
                className="group bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-indigo-500/50 transition-colors"
              >
                {/* Brief Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {brief.project_title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatDate(brief.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {brief.is_approved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      copyShareLink(brief.slug);
                    }}
                    className="flex-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 py-2 px-3 rounded border border-slate-700 hover:border-indigo-500/50 transition-colors"
                  >
                    {copiedSlug === brief.slug ? "✓ Copied" : "Copy Link"}
                  </button>
                  <Link
                    href={`/brief/${brief.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-xs font-medium text-gray-300 hover:text-white py-2 px-3 rounded border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tips Section */}
        {!loading && briefs.length > 0 && (
          <div className="mt-12 p-6 bg-slate-900 rounded-lg border border-slate-800">
            <h3 className="text-lg font-medium text-white mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-indigo-400">•</span>
                <span>Share the brief link with your client to let them review and approve in one click.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">•</span>
                <span>Once approved, you have a timestamped record of agreement.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">•</span>
                <span>Free plan includes 5 briefs per month. Upgrade to Pro for unlimited.</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
