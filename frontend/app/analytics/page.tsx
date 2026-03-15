"use client";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400 mb-8">Pro plan feature - Track your briefs and statistics.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          {[
            { label: "Total Briefs", value: "0" },
            { label: "Approved", value: "0" },
            { label: "Pending", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-900 rounded-lg border border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Charts & Metrics</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
