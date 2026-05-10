"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard, Building2, Users, FileStack, Palette, Bell,
  Upload, GraduationCap, ClipboardCheck, BookTemplate
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/institutions", label: "Institutions", icon: Building2 },
  { href: "/admin/batches", label: "Print Orders", icon: FileStack },
  { href: "/admin/designs", label: "Designs", icon: Upload },
  { href: "/admin/templates", label: "Templates", icon: Palette },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

const institutionLinks = [
  { href: "/institution/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/institution/students", label: "Students", icon: GraduationCap },
  { href: "/institution/batches", label: "Print Batches", icon: ClipboardCheck },
  { href: "/institution/templates", label: "Templates", icon: BookTemplate },
  { href: "/institution/members", label: "Team Members", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const links = user?.role === "printShopAdmin" ? adminLinks : institutionLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
      <div className="p-4 space-y-1">
        {user?.role !== "printShopAdmin" && user?.institution && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium uppercase">Institution</p>
            <p className="text-sm font-semibold text-blue-900 truncate">
              {typeof user.institution === "object" ? user.institution.name : "My Institution"}
            </p>
          </div>
        )}
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-900"
              )}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
