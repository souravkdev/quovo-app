"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isLoggedIn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out Quovo",
    features: [
      "5 briefs per month",
      "Basic brief generation",
      "Shareable brief links",
      "Client approval tracking",
      "Email support",
    ],
    cta: "Get Started",
    ctaVariant: "secondary" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For professional freelancers",
    features: [
      "Unlimited briefs",
      "Advanced AI brief generation",
      "Priority shareable links",
      "Client approval tracking",
      "Email support",
      "Custom branding (coming soon)",
    ],
    cta: "Upgrade to Pro",
    ctaVariant: "primary" as const,
    popular: true,
  },
  {
    name: "Agency",
    price: "$29",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Unlimited briefs",
      "Advanced AI brief generation",
      "Team collaboration (coming soon)",
      "White-label briefs (coming soon)",
      "Priority support",
      "Custom branding",
      "Team analytics (coming soon)",
    ],
    cta: "Upgrade to Agency",
    ctaVariant: "primary" as const,
    popular: false,
  },
];

export default function Pricing() {
  const router = useRouter();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleUpgrade = async (plan: string) => {
    if (plan === "Free") {
      router.push("/dashboard");
      return;
    }

    if (!isLoggedIn()) {
      // Redirect to GitHub login
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/auth/github/callback/`;
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
      return;
    }

    try {
      setUpgrading(plan);
      const response = await api.post("/payments/create-checkout/", {
        plan: plan.toLowerCase(),
      });
      // Redirect to Stripe checkout
      window.location.href = response.data.checkout_url;
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to create checkout session";
      setError(message);
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-medium tracking-tight text-white">
          qu<span className="text-indigo-500">o</span>vo
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link
            href="http://localhost:8000/auth/github/"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your freelance business. All plans include everything you need to streamline client communication.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border transition-all ${
                plan.popular
                  ? "border-indigo-500 bg-slate-900 ring-2 ring-indigo-500/20"
                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-medium text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-medium text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                  {plan.name !== "Free" && (
                    <p className="text-xs text-gray-500 mt-2">Billed monthly, cancel anytime</p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={upgrading === plan.name}
                  className={`w-full py-3 px-4 rounded-lg font-medium mb-8 transition-colors ${
                    plan.ctaVariant === "primary"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      : "bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
                  } disabled:cursor-not-allowed`}
                >
                  {upgrading === plan.name ? "Processing..." : plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-4 border-t border-slate-800 pt-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-300 text-sm">
                        {feature.includes("(coming soon)") ? (
                          <>
                            {feature.replace(" (coming soon)", "")}
                            <span className="text-gray-500 text-xs ml-2">(coming soon)</span>
                          </>
                        ) : (
                          feature
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium text-white mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Can I switch plans anytime?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">What happens if I exceed my monthly limit?</h3>
              <p className="text-gray-400">
                On the Free plan, you'll need to upgrade to Pro to create more briefs. We'll notify you when you're approaching your limit.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">
                Yes! The Free plan is unlimited in duration. You get 5 briefs per month to try out Quovo.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit and debit cards through Stripe. Payments are secure and encrypted.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">
                Yes, we offer a 7-day money-back guarantee on paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-indigo-600/10 border border-indigo-600/30 rounded-lg p-8">
          <h2 className="text-2xl font-medium text-white mb-3">Ready to streamline your project briefs?</h2>
          <p className="text-gray-400 mb-6">Start with a free plan and upgrade whenever you're ready.</p>
          <button
            onClick={() => handleUpgrade("Free")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-16 py-8 text-center text-gray-500 text-sm">
        <p>Made with <span className="text-indigo-500">quovo</span> — Project briefs, simplified.</p>
      </div>
    </div>
  );
}
