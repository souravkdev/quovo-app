import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6">

      {/* Hero */}
      <section className="text-center py-24">
        <div className="inline-block text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full mb-6">
          Built for freelancers
        </div>
        <h1 className="text-5xl font-medium tracking-tight text-gray-100 mb-6 leading-tight">
          Stop losing money to<br />
          <span className="text-indigo-500">"I thought that was included."</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Paste your client's message. Get a professional project brief with a
          shareable link your client can approve in one click.
        </p>
        <Link
          href="http://localhost:8000/auth/github/"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Get started free
        </Link>
        <p className="text-xs text-gray-400 mt-3">
          Free plan includes 5 briefs/month. No credit card required.
        </p>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-gray-100">
        <h2 className="text-2xl font-medium text-center mb-12">How it works</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { step: "1", title: "Paste client message", desc: "Copy paste whatever your client sent — WhatsApp, email, DM. Doesn't matter how messy." },
            { step: "2", title: "Get a brief instantly", desc: "Quovo generates a full professional brief with scope, deliverables, timeline and pricing." },
            { step: "3", title: "Client approves", desc: "Share a link. Client reads the brief and clicks approve. You have a timestamped record." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t border-gray-100">
        <h2 className="text-2xl font-medium mb-4">Ready to protect your work?</h2>
        <p className="text-gray-500 mb-8 text-sm">Join freelancers who never deal with scope creep again.</p>
        <Link
          href="http://localhost:8000/auth/github/"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </Link>
      </section>

    </div>
  );
}