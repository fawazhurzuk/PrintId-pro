"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardAPI } from "@/lib/api";
import {
  GraduationCap, FileEdit, CheckCircle, Send, ClipboardCheck, ArrowRight
} from "lucide-react";

interface DashboardData {
  institution: { name: string; logo: string; email: string };
  stats: {
    totalStudents: number;
    draftStudents: number;
    submittedStudents: number;
    reviewedStudents: number;
    finalizedStudents: number;
    totalBatches: number;
  };
  recentBatches: Array<{
    _id: string;
    totalCards: number;
    status: string;
    createdAt: string;
  }>;
}

export default function InstitutionDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.institution().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  const stats = data?.stats;

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents || 0, icon: GraduationCap, color: "bg-blue-500" },
    { label: "Draft", value: stats?.draftStudents || 0, icon: FileEdit, color: "bg-gray-500" },
    { label: "Submitted", value: stats?.submittedStudents || 0, icon: Send, color: "bg-orange-500" },
    { label: "Reviewed", value: stats?.reviewedStudents || 0, icon: CheckCircle, color: "bg-green-500" },
    { label: "Finalized", value: stats?.finalizedStudents || 0, icon: ClipboardCheck, color: "bg-emerald-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Institution Dashboard</h1>
        <p className="text-gray-600">{data?.institution?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/institution/students" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <div className="flex items-center space-x-3">
                <GraduationCap size={20} className="text-blue-900" />
                <span className="font-medium text-blue-900">Add New Students</span>
              </div>
              <ArrowRight size={16} className="text-blue-600" />
            </Link>
            <Link href="/institution/templates" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <div className="flex items-center space-x-3">
                <ClipboardCheck size={20} className="text-purple-900" />
                <span className="font-medium text-purple-900">Select ID Card Template</span>
              </div>
              <ArrowRight size={16} className="text-purple-600" />
            </Link>
            <Link href="/institution/members" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <div className="flex items-center space-x-3">
                <Send size={20} className="text-green-900" />
                <span className="font-medium text-green-900">Manage Team Members</span>
              </div>
              <ArrowRight size={16} className="text-green-600" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Batches</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.recentBatches?.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">No batches yet. Finalize student records to create a batch.</div>
            )}
            {data?.recentBatches?.map((batch) => (
              <div key={batch._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{batch.totalCards} ID Cards</p>
                  <p className="text-xs text-gray-500">{new Date(batch.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  batch.status === "finalized" ? "bg-yellow-100 text-yellow-800" :
                  batch.status === "printing" ? "bg-blue-100 text-blue-800" :
                  batch.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>{batch.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
