"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight, Zap, BarChart3, Lock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LandingPage() {
  const params = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = params.get("toast");
    if (t === "logged_out") {
      setToast("Successfully logged out.");
      // Auto-hide
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const features = [
    {
      icon: Zap,
      title: "Instant Briefs",
      description: "Convert messy client messages into professional project briefs in seconds",
    },
    {
      icon: Lock,
      title: "Client Approval",
      description: "Share a link and get timestamped client approval with one click",
    },
    {
      icon: BarChart3,
      title: "Smart Pricing",
      description: "AI-powered pricing estimates based on your hourly rate and project scope",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Manage multiple team members and delegate brief creation (Agency plan)",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for freelancers getting started",
      features: [
        "5 briefs per month",
        "Basic brief generation",
        "Client approval links",
        "Email support",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      frequency: "/month",
      description: "For active freelancers",
      features: [
        "Unlimited briefs",
        "AI Chat assistant",
        "Analytics dashboard",
        "Priority support",
        "Custom branding",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Agency",
      price: "$99",
      frequency: "/month",
      description: "For teams and agencies",
      features: [
        "Everything in Pro",
        "Team management",
        "Client integrations",
        "API access",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow-lg">
            {toast}
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="text-gray-900">qu</span>
            <span className="text-indigo-600">o</span>
            <span className="text-gray-900">vo</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            <Link
              href="/signin"
              className="text-sm font-medium text-gray-900 hover:text-indigo-600"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block text-xs font-semibold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full mb-6">
              🚀 Launch faster, earn more
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional briefs in seconds
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Stop losing money to scope creep. Paste your client's message, get a professional
              brief, and get approval with one click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get started free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                View pricing
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              ✓ Free plan includes 5 briefs/month • No credit card required
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 font-medium">Professional Brief</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage projects like a pro</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Quovo works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Paste",
                description: "Copy any client message (WhatsApp, email, DM—doesn't matter how messy)",
              },
              {
                step: "02",
                title: "Generate",
                description: "Our AI creates a professional brief with scope, timeline, and pricing",
              },
              {
                step: "03",
                title: "Approve",
                description: "Share a link and get instant timestamped approval from your client",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="text-5xl font-bold text-indigo-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl transition-all ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white border-2 border-indigo-600 scale-105 shadow-2xl"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.frequency && <span className={plan.highlighted ? "text-indigo-100" : "text-gray-600"}>{plan.frequency}</span>}
                  </div>

                  <Link
                    href="/signup"
                    className={`block w-full text-center py-3 rounded-lg font-semibold mb-8 transition-colors ${
                      plan.highlighted
                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <div className="space-y-4">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className={`text-center mt-12 text-sm`}>
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does Quovo generate briefs?",
                a: "Quovo uses AI to analyze client messages and extract key project details. It then creates a professional brief automatically with scope, timeline, deliverables, and pricing estimates.",
              },
              {
                q: "Can clients edit the brief after I share it?",
                a: "No, clients can only approve or request changes. You control the final brief content and can make updates before sharing.",
              },
              {
                q: "What if I need to change a brief after my client approves it?",
                a: "You can create a new version and share an updated link. The original approval timestamp remains on record.",
              },
              {
                q: "Do you offer a free trial?",
                a: "Yes! Start with our free plan that includes 5 briefs per month. You can upgrade anytime with a 14-day trial of paid plans.",
              },
              {
                q: "Can I use Quovo for team projects?",
                a: "Absolutely! Our Agency plan supports unlimited team members, client integrations, and API access for enterprise needs.",
              },
            ].map((item, idx) => (
              <details key={idx} className="group border border-gray-200 rounded-lg">
                <summary className="cursor-pointer p-6 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="font-semibold text-gray-900">{item.q}</span>
                  <span className="text-gray-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 py-4 border-t border-gray-200">
                  <p className="text-gray-600">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to stop losing money to scope creep?</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join thousands of freelancers saving hours and protecting their projects
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-lg"
          >
            Get started free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold mb-4">
                <span>qu</span>
                <span className="text-indigo-500">o</span>
                <span>vo</span>
              </div>
              <p className="text-sm">Professional briefs for freelancers</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Product</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Company</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Legal</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Quovo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
