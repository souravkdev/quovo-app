"use client";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
        <p className="text-gray-400 mb-8">Agency plan feature - Connect your favorite tools.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Slack", "Zapier", "GitHub", "Jira"].map((integration) => (
            <div key={integration} className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h3 className="text-white font-semibold mb-2">{integration}</h3>
              <p className="text-gray-400 text-sm mb-4">Connect with {integration}</p>
              <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                Configure →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
