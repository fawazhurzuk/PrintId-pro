"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardAPI } from "@/lib/api";
import {
  Building2, Users, FileStack, Printer, Bell, TrendingUp, ArrowRight
} from "lucide-react";

interface DashboardData {
  stats: {
    totalInstitutions: number;
    activeInstitutions: number;
    totalStudents: number;
    totalBatches: number;
    pendingBatches: number;
    completedBatches: number;
    unreadNotifications: number;
  };
  recentBatches: Array<{
    _id: string;
    institution: { name: string };
    totalCards: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.admin().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    { label: "Total Institutions", value: stats?.totalInstitutions || 0, icon: Building2, color: "bg-blue-500", href: "/admin/institutions" },
    { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "bg-green-500", href: "/admin/batches" },
    { label: "Pending Orders", value: stats?.pendingBatches || 0, icon: FileStack, color: "bg-orange-500", href: "/admin/batches" },
    { label: "Completed Orders", value: stats?.completedBatches || 0, icon: Printer, color: "bg-emerald-500", href: "/admin/batches" },
    { label: "Total Batches", value: stats?.totalBatches || 0, icon: TrendingUp, color: "bg-purple-500", href: "/admin/batches" },
    { label: "Notifications", value: stats?.unreadNotifications || 0, icon: Bell, color: "bg-red-500", href: "/admin/notifications" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Print Shop Dashboard</h1>
        <p className="text-gray-600">Overview of your ID card management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Print Orders</h2>
          <Link href="/admin/batches" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {data?.recentBatches?.length === 0 && (
            <div className="p-8 text-center text-gray-500">No print orders yet.</div>
          )}
          {data?.recentBatches?.map((batch) => (
            <Link key={batch._id} href={`/admin/batches`} className="block p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{batch.institution?.name}</p>
                  <p className="text-sm text-gray-500">{batch.totalCards} ID cards</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    batch.status === "finalized" ? "bg-yellow-100 text-yellow-800" :
                    batch.status === "printing" ? "bg-blue-100 text-blue-800" :
                    batch.status === "completed" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {batch.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(batch.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
