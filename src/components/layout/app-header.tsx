"use client";

import { Search, Bell, Menu, ChevronDown, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/dropdown";

export function AppHeader({
  user,
  onMenuClick,
  onSearch,
  searchValue,
}: {
  user: { email: string | undefined; name?: string } | null;
  onMenuClick?: () => void;
  onSearch: (value: string) => void;
  searchValue: string;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass border-b border-[rgb(var(--border))]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Logo & Business Selector */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-[rgb(var(--foreground))]">Khatabook</h1>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Digital Ledger</p>
              </div>
            </div>

            {/* Business Selector */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))]">
              <Building2 className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
              <Select
                value="main"
                onChange={() => {}}
                options={[
                  { label: "Main Business", value: "main" },
                  { label: "Branch Office", value: "branch" },
                ]}
                className="bg-transparent border-0 px-0 py-0 h-auto text-sm font-medium w-auto"
              />
              <ChevronDown className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl hidden lg:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="search"
                placeholder="Search parties, bills, transactions..."
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <div className="lg:hidden flex-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-sm"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              {notificationsOpen && (
                <DropdownMenu
                  trigger={null}
                  items={[
                    { label: "No new notifications", value: "none", disabled: true },
                  ]}
                  onSelect={() => {}}
                  align="end"
                />
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors"
                aria-label="User menu"
              >
                <Avatar
                  fallback={user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  size="md"
                  className="bg-gradient-to-br from-indigo-500 to-indigo-700"
                />
                <span className="hidden sm:block text-sm font-medium text-[rgb(var(--foreground))]">
                  {user?.name || "User"}
                </span>
                <ChevronDown className="h-4 w-4 text-[rgb(var(--muted-foreground))] hidden sm:block" />
              </button>

              {userMenuOpen && (
                <DropdownMenu
                  trigger={null}
                  items={[
                    { label: "Profile", value: "profile", icon: <Building2 className="h-4 w-4" /> },
                    { divider: true },
                    { label: "Settings", value: "settings" },
                    { label: "Billing", value: "billing" },
                    { divider: true },
                    { label: "Sign out", value: "signout" },
                  ]}
                  onSelect={() => {}}
                  align="end"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}