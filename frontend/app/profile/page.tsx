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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Avatar & Name */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Name</p>
                  <p className="text-2xl font-bold text-white">{user.name}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <p className="text-sm text-gray-400 mb-2">Email</p>
              <p className="text-white mb-4">{user.email}</p>
              <p className="text-sm text-gray-400 mb-2">Member Since</p>
              <p className="text-white">March 15, 2026</p>
            </div>

            {/* Plan Info */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <p className="text-sm text-gray-400 mb-2">Current Plan</p>
              <p className="text-2xl font-bold text-indigo-400 capitalize mb-4">{user.plan} Plan</p>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                View Plans
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
