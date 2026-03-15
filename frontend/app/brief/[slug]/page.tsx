"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

interface Brief {
  id: string;
  slug: string;
  project_title: string;
  summary: string;
  deliverables: string[];
  timeline_weeks: number;
  revision_rounds: number;
  price_estimate_min: number;
  price_estimate_max: number;
  assumptions: string[];
  out_of_scope: string[];
  next_steps: string[];
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
}

export default function BriefDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    fetchBrief();
  }, [slug]);

  const fetchBrief = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/briefs/public/${slug}/`);
      setBrief(response.data);
      setApproved(response.data.is_approved);
    } catch (err: any) {
      setError(err.response?.data?.error || "Brief not found");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      const response = await api.post(`/briefs/approve/${slug}/`);
      setBrief(response.data.brief);
      setApproved(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to approve brief");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading brief...</p>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-white mb-2">Brief Not Found</h1>
          <p className="text-gray-400 mb-6">{error || "The brief you're looking for doesn't exist."}</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950 px-6 py-4">
        <Link href="/" className="text-xl font-medium tracking-tight text-white">
          qu<span className="text-indigo-500">o</span>vo
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Approval Banner */}
        {approved && brief.approved_at && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-green-400 font-medium">✓ Approved</p>
              <p className="text-sm text-green-300">Approved on {new Date(brief.approved_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
            </div>
          </div>
        )}

        {/* Brief Content */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 mb-8">
          {/* Title */}
          <h1 className="text-4xl font-medium text-white mb-4">{brief.project_title}</h1>

          {/* Summary */}
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">{brief.summary}</p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-slate-700">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Timeline</p>
              <p className="text-2xl font-medium text-white mt-1">{brief.timeline_weeks}w</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Revisions</p>
              <p className="text-2xl font-medium text-white mt-1">{brief.revision_rounds}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Price Range</p>
              <p className="text-2xl font-medium text-white mt-1">
                ${brief.price_estimate_min.toLocaleString()}-${brief.price_estimate_max.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase">Status</p>
              <p className={`text-2xl font-medium mt-1 ${approved ? "text-green-400" : "text-yellow-400"}`}>
                {approved ? "✓ Approved" : "Pending"}
              </p>
            </div>
          </div>

          {/* Deliverables */}
          <section className="mb-8">
            <h2 className="text-2xl font-medium text-white mb-4">Deliverables</h2>
            <ul className="space-y-3">
              {brief.deliverables.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Assumptions */}
          {brief.assumptions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-medium text-white mb-4">Assumptions</h2>
              <ul className="space-y-2">
                {brief.assumptions.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-indigo-400 flex-shrink-0">•</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Out of Scope */}
          {brief.out_of_scope.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-medium text-white mb-4">Out of Scope</h2>
              <ul className="space-y-2">
                {brief.out_of_scope.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-red-400 flex-shrink-0">✕</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Next Steps */}
          {brief.next_steps.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-medium text-white mb-4">Next Steps</h2>
              <ol className="space-y-3">
                {brief.next_steps.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-indigo-400 font-medium flex-shrink-0">{idx + 1}.</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Approval Action */}
          {!approved && (
            <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/50 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Approve this Brief</h3>
              <p className="text-gray-400 mb-4">
                Click the button below to approve this brief. This creates a timestamped record that you've reviewed and agreed to these terms.
              </p>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {approving ? "Approving..." : "✓ I Approve this Brief"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-800">
          <p className="text-sm text-gray-500">
            Made with <span className="text-indigo-500">quovo</span> — Project briefs, simplified.
          </p>
        </div>
      </div>
    </div>
  );
}
