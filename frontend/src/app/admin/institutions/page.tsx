"use client";

import { useEffect, useState, useCallback } from "react";
import { institutionAPI } from "@/lib/api";
import { Building2, Plus, Search, Copy, Check } from "lucide-react";

interface Institution {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  isOnboarded: boolean;
  studentCount: number;
  registrationToken: string;
  createdAt: string;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [creating, setCreating] = useState(false);

  const fetchInstitutions = useCallback(() => {
    institutionAPI.list({ search }).then((res) => {
      setInstitutions(res.data.institutions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await institutionAPI.create(form);
      setShowCreate(false);
      setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
      fetchInstitutions();
    } catch {
      alert("Failed to create institution.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (token: string, id: string) => {
    const link = `${window.location.origin}/auth/register?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600">Manage onboarded institutions</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
          <Plus size={18} />
          <span>Onboard Institution</span>
        </button>
      </div>

      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Search institutions..."
        />
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboard New Institution</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Institution Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
                  {creating ? "Creating..." : "Create & Get Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Institution</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Students</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {institutions.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No institutions found.</td></tr>
              )}
              {institutions.map((inst) => (
                <tr key={inst._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 size={16} className="text-blue-900" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{inst.name}</p>
                        <p className="text-xs text-gray-500">{inst.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{inst.email}</p>
                    <p className="text-xs text-gray-500">{inst.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      inst.status === "active" ? "bg-green-100 text-green-800" :
                      inst.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {inst.isOnboarded ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{inst.studentCount}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyLink(inst.registrationToken, inst._id)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      title="Copy registration link"
                    >
                      {copiedId === inst._id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === inst._id ? "Copied!" : "Copy Link"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
