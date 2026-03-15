"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isLoggedIn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  plan: "free" | "pro" | "agency";
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
      return;
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me/");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-8">Manage your account preferences and settings.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="w-full bg-slate-800 text-gray-300 rounded px-3 py-2 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-slate-800 text-gray-300 rounded px-3 py-2 border border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Plan Section */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Plan & Billing</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 mb-1">Current Plan</p>
                  <p className="text-2xl font-bold text-indigo-400 capitalize">{user?.plan} Plan</p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Manage Plan
                </button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-gray-300">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-gray-300">Brief updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-gray-300">Marketing emails</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
