"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getParty, getTransactions, createTransaction, deleteTransaction } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardSummary } from "@/components/layout/summary-cards";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Phone, MoreVertical, Trash2, Calendar, FileText, IndianRupee, CreditCard, Wallet } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function PartyContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const partyId = resolvedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [party, setParty] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<"gave" | "got">("gave");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [billNo, setBillNo] = useState("");

  useEffect(() => {
    if (!date) {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [date]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && partyId) loadData();
  }, [user, partyId]);

  async function loadData() {
    setLoading(true);
    const [pRes, tRes] = await Promise.all([getParty(partyId), getTransactions(partyId)]);
    if (pRes.data) setParty(pRes.data);
    if (tRes.data) setTransactions(tRes.data);
    setLoading(false);
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !amount) return;
    const { error } = await createTransaction({
      party_id: partyId,
      amount: parseFloat(amount),
      type: txType,
      date,
      note,
      bill_no: billNo,
      user_id: user.id,
    });
    if (!error) {
      setShowTxModal(false);
      setAmount("");
      setNote("");
      setBillNo("");
      loadData();
    }
  }

  const totalGot = transactions
    .filter((t) => t.type === "got")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalGave = transactions
    .filter((t) => t.type === "gave")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalGot - totalGave;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading ledger...</span>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground font-medium">Party not found</p>
        <Button variant="secondary" onClick={() => router.push("/")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        user={user ? { email: user.email || "", name: user.user_metadata?.full_name } : null}
        onSearch={() => {}}
        searchValue=""
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {party.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{party.name}</h1>
                <p className="text-muted-foreground">{party.phone || "No phone number"}</p>
              </div>
            </div>
            {party.gstin && (
              <p className="mt-2 text-sm font-mono text-muted-foreground">GSTIN: {party.gstin}</p>
            )}
            {party.address && (
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {party.address}
              </p>
            )}
          </div>
          {party.phone && (
            <a href={`tel:${party.phone}`} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
              <Phone className="h-5 w-5" />
              <span className="font-medium hidden sm:inline">Call</span>
            </a>
          )}
        </div>

        {/* Summary Cards */}
        <DashboardSummary
          totalGive={totalGave}
          totalGet={totalGot}
          totalParties={1}
          totalTransactions={transactions.length}
        />

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="destructive"
            className="h-14 gap-2"
            onClick={() => {
              setTxType("gave");
              setShowTxModal(true);
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            You Gave (–)
          </Button>
          <Button
            variant="primary"
            className="h-14 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            onClick={() => {
              setTxType("got");
              setShowTxModal(true);
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            You Got (+)
          </Button>
        </div>

        {/* Transactions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Transactions</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {totalGot > 0 ? formatCurrency(totalGot) : "0"}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {totalGave > 0 ? formatCurrency(totalGave) : "0"}
              </span>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                netBalance > 0 && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                netBalance < 0 && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                netBalance === 0 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {netBalance > 0 ? "Net Receivable" : netBalance < 0 ? "Net Payable" : "Settled"}
              </div>
            </div>
          </div>

          <TransactionList
            transactions={transactions.map(t => ({
              ...t,
              partyName: party.name,
            }))}
            onEdit={(tx) => {
              setTxType(tx.type);
              setAmount(String(tx.amount));
              setDate(tx.date);
              setNote(tx.note || "");
              setBillNo(tx.billNo || "");
              setShowTxModal(true);
            }}
            onDelete={async (id) => {
              if (confirm("Delete this transaction?")) {
                await deleteTransaction(id);
                loadData();
              }
            }}
            onView={(tx) => {}}
            emptyMessage={`No transactions with ${party.name} yet. Record your first entry using the buttons above.`}
          />
        </div>
      </main>

      {/* Add Transaction Modal */}
      <Modal
        open={showTxModal}
        onClose={() => setShowTxModal(false)}
        title={txType === "got" ? "Record Amount Received" : "Record Amount Paid"}
        size="lg"
      >
        <form onSubmit={handleAddTransaction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {txType === "got" ? "Received" : "Paid"} Amount (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-xl border bg-background text-right text-xl font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 h-11 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Bill No (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. INV-001"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  className="w-full pl-12 pr-4 h-11 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes / Description</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="e.g. Cash payment, advance, partial settlement..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowTxModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant={txType === "got" ? "primary" : "destructive"}
              className="flex-1"
            >
              {txType === "got" ? "Record Received" : "Record Paid"}
            </Button>
          </div>
        </form>
      </Modal>
      <BottomNav />
    </div>
  );
}