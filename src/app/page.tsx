"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getParties, getTransactions, createParty } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardSummary } from "@/components/layout/summary-cards";
import { PartyList } from "@/components/parties/party-card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Search, Users, Filter, X } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [parties, setParties] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "customers" | "suppliers" | "pending">("all");

  // Modals
  const [showAddParty, setShowAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyPhone, setNewPartyPhone] = useState("");
  const [newPartyType, setNewPartyType] = useState<"customer" | "supplier">("customer");
  const [newPartyGstin, setNewPartyGstin] = useState("");
  const [newPartyAddress, setNewPartyAddress] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [pRes, tRes] = await Promise.all([getParties(), getTransactions()]);
    if (pRes.data) setParties(pRes.data);
    if (tRes.data) setTransactions(tRes.data);
    setLoading(false);
  }

  const partyBalances = parties.map((party) => {
    const pTxs = transactions.filter((t) => t.party_id === party.id);
    let balance = 0;
    pTxs.forEach((t) => {
      if (t.type === "got") balance += Number(t.amount);
      if (t.type === "gave") balance -= Number(t.amount);
    });
    return { ...party, balance, txCount: pTxs.length };
  });

  const totalGot = partyBalances
    .filter((p) => p.balance > 0)
    .reduce((acc, p) => acc + p.balance, 0);
  const totalGave = partyBalances
    .filter((p) => p.balance < 0)
    .reduce((acc, p) => acc + Math.abs(p.balance), 0);

  const filteredParties = partyBalances.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search));
    if (filter === "customers") return matchesSearch && p.type === "customer";
    if (filter === "suppliers") return matchesSearch && p.type === "supplier";
    if (filter === "pending") return matchesSearch && p.balance !== 0;
    return matchesSearch;
  });

  async function handleCreateParty(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newPartyName) return;
    const { error } = await createParty({
      name: newPartyName,
      phone: newPartyPhone,
      type: newPartyType,
      gstin: newPartyGstin,
      address: newPartyAddress,
      user_id: user.id,
    });
    if (!error) {
      setShowAddParty(false);
      setNewPartyName("");
      setNewPartyPhone("");
      setNewPartyGstin("");
      setNewPartyAddress("");
      loadData();
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <AppHeader
        user={user ? { email: user.email || "", name: user.user_metadata?.full_name } : null}
        onSearch={setSearch}
        searchValue={search}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <DashboardSummary
          totalGive={totalGave}
          totalGet={totalGot}
          totalParties={parties.length}
          totalTransactions={transactions.length}
        />

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              type="search"
              placeholder="Search parties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-[rgb(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-[rgb(var(--secondary))] rounded-xl p-1">
              {(["all", "customers", "suppliers", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filter === f
                      ? "bg-[rgb(var(--background))] shadow-sm text-[rgb(var(--foreground))]"
                      : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddParty(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Party
            </Button>
          </div>
        </div>

        {/* Parties List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Parties ({filteredParties.length})
            </h2>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">
              {partyBalances.filter((p) => p.balance > 0).length} to receive •{" "}
              {partyBalances.filter((p) => p.balance < 0).length} to pay
            </div>
          </div>

          <PartyList
            parties={filteredParties}
            onPartyClick={(party) => router.push(`/party/${party.id}`)}
            onEdit={(party) => {
              setNewPartyName(party.name);
              setNewPartyPhone(party.phone || "");
              setNewPartyType(party.type);
              setNewPartyGstin(party.gstin || "");
              setNewPartyAddress(party.address || "");
              setShowAddParty(true);
            }}
            onDelete={async (id) => {
              if (confirm("Delete this party? This will also delete all associated transactions.")) {
                // TODO: implement delete
              }
            }}
            onMessage={(party) => {
              if (party.phone) {
                window.open(`https://wa.me/91${party.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(party.name)}%2C%20this%20is%20a%20reminder%20about%20your%20pending%20balance.`, "_blank");
              }
            }}
          />
        </div>
      </main>

      {/* Add Party Modal */}
      <Modal
        open={showAddParty}
        onClose={() => setShowAddParty(false)}
        title="Add New Party"
        description="Create a new customer or supplier entry"
        size="lg"
      >
        <form onSubmit={handleCreateParty} className="space-y-5">
          <Input
            label="Party Name *"
            placeholder="e.g. Sharma Traders"
            value={newPartyName}
            onChange={(e) => setNewPartyName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            placeholder="9876543210"
            value={newPartyPhone}
            onChange={(e) => setNewPartyPhone(e.target.value)}
            type="tel"
          />
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Party Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewPartyType("customer")}
                className={cn(
                  "py-3 px-4 rounded-xl font-semibold border transition-all",
                  newPartyType === "customer"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
                    : "bg-[rgb(var(--secondary))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))]"
                )}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setNewPartyType("supplier")}
                className={cn(
                  "py-3 px-4 rounded-xl font-semibold border transition-all",
                  newPartyType === "supplier"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400"
                    : "bg-[rgb(var(--secondary))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))]"
                )}
              >
                Supplier
              </button>
            </div>
          </div>
          <Input
            label="GSTIN (Optional)"
            placeholder="22AAAAA0000A1Z5"
            value={newPartyGstin}
            onChange={(e) => setNewPartyGstin(e.target.value.toUpperCase())}
          />
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Address (Optional)</label>
            <textarea
              value={newPartyAddress}
              onChange={(e) => setNewPartyAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border bg-[rgb(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all resize-none"
              placeholder="Shop/Street address..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowAddParty(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Party
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}