"use client";

import { useEffect, useState } from "react";
import { notificationAPI } from "@/lib/api";
import { Bell, CheckCheck, Building2, Printer } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedInstitution?: { name: string };
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.list().then((res) => {
      setNotifications(res.data.notifications);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await notificationAPI.markRead(id);
    setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "batch_finalized": return <Printer size={20} className="text-yellow-600" />;
      case "institution_registered": return <Building2 size={20} className="text-blue-600" />;
      case "batch_completed": return <CheckCheck size={20} className="text-green-600" />;
      default: return <Bell size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated on print orders and registrations</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition">
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No notifications yet.</p>
          </div>
        )}
        {notifications.map((notif) => (
          <div
            key={notif._id}
            className={`p-4 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition ${!notif.isRead ? "bg-blue-50/50" : ""}`}
            onClick={() => markRead(notif._id)}
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className={`font-medium ${!notif.isRead ? "text-gray-900" : "text-gray-700"}`}>{notif.title}</p>
                {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
