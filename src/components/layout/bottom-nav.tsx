"use client";

import { usePathname } from "next/navigation";
import { Home, CreditCard, Package, Users, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Billing", icon: CreditCard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/", label: "Parties", icon: Users, asChild: true }, // Special: navigates to dashboard with parties view
];

export function BottomNav() {
  const pathname = usePathname();

  // Only show on mobile
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border bg-background/80 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname.startsWith("/party/"));
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[70px]",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-current")} strokeWidth={isActive ? 3 : 2} />
              <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}