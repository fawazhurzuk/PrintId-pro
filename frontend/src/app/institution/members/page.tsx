"use client";

import { useEffect, useState, useCallback } from "react";
import { institutionAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Users, Plus, User } from "lucide-react";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export default function MembersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "institutionAdmin";
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [adding, setAdding] = useState(false);

  const instId = typeof user?.institution === "object" ? user?.institution?._id : user?.institution;

  const fetchMembers = useCallback(() => {
    if (!instId) return;
    institutionAPI.getMembers(instId as string).then((res) => {
      setMembers(res.data.members);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [instId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instId) return;
    setAdding(true);
    try {
      await institutionAPI.addMember(instId as string, form);
      setShowAdd(false);
      setForm({ name: "", email: "", password: "", phone: "" });
      fetchMembers();
    } catch {
      alert("Failed to add member.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">Manage members who can collect student data</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
            <Plus size={18} />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required minLength={6} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex space-x-3 mt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
                  {adding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-8 text-center text-gray-500 border">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No team members yet. Add members who can help collect student data.</p>
          </div>
        )}
        {members.map((m) => (
          <div key={m._id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-blue-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{m.name}</p>
                <p className="text-xs text-gray-500 truncate">{m.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                m.role === "institutionAdmin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>{m.role === "institutionAdmin" ? "Admin" : "Member"}</span>
              <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
