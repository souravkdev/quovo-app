"use client";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
        <p className="text-gray-400 mb-8">Find answers and get support for Quovo.</p>

        <div className="space-y-6">
          {/* FAQ */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                "How do I create a brief?",
                "Can I share a brief with my client?",
                "What happens if my client approves a brief?",
                "How do I upgrade my plan?",
              ].map((question) => (
                <button
                  key={question}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-300">{question}</span>
                  <span className="text-gray-500">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Need More Help?</h2>
            <div className="space-y-3">
              <a
                href="mailto:support@quovo.app"
                className="block p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
              >
                📧 Email Support
              </a>
              <a
                href="#"
                className="block p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
              >
                💬 Live Chat
              </a>
              <a
                href="#"
                className="block p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
              >
                📚 Documentation
              </a>
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Service Status</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-green-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
