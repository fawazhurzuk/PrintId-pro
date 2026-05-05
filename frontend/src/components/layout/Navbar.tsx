"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Bell, LogOut, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationAPI } from "@/lib/api";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI.list({ unread: "true" }).then((res) => {
        setUnreadCount(res.data.unreadCount);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const dashboardPath = user?.role === "printShopAdmin" ? "/admin/dashboard" : "/institution/dashboard";
  const notifPath = user?.role === "printShopAdmin" ? "/admin/notifications" : "/institution/dashboard";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isAuthenticated ? dashboardPath : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-blue-900">PrintID Pro</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link href={notifPath} className="relative p-2 text-gray-600 hover:text-blue-900 transition">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-900" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 text-xs capitalize">
                    {user?.role === "printShopAdmin" ? "Print Shop Admin" : user?.role === "institutionAdmin" ? "Institution Admin" : "Member"}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 transition" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          )}

          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-600">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && isAuthenticated && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 space-y-2">
          <div className="flex items-center space-x-2 py-2">
            <User size={16} className="text-blue-900" />
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <Link href={notifPath} className="block py-2 text-gray-700 hover:text-blue-900" onClick={() => setMenuOpen(false)}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Link>
          <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:text-red-700">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
