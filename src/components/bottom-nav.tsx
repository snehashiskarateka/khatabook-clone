"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, Package, LayoutDashboard } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const navItems = [
    { label: "Parties", href: "/", icon: Users },
    { label: "Bills", href: "/invoices", icon: FileText },
    { label: "Products", href: "/products", icon: Package },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-lg no-print">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-blue-600 font-bold scale-105"
                  : "text-slate-400 font-medium hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? "bg-blue-50 text-blue-600" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}