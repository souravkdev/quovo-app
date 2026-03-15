"use client";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Team</h1>
            <p className="text-gray-400">Agency plan feature - Manage team members and collaborators.</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            + Invite Member
          </button>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          <p className="text-gray-400">No team members yet. Invite your first team member to get started.</p>
        </div>
      </div>
    </div>
  );
}
