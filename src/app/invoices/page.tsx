"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getInvoices, getParties, getProducts, createInvoice, deleteInvoice, generateInvoiceNumber } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/dropdown";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, FileText, Trash2, Search, Eye, Edit, Download, MoreVertical } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Invoice Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<any[]>([{ name: "", qty: 1, rate: 0, gstRate: 18 }]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!date) setDate(new Date().toISOString().split("T")[0]);
  }, [date]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [invRes, pRes, prRes] = await Promise.all([getInvoices(), getParties(), getProducts()]);
    if (invRes.data) setInvoices(invRes.data);
    if (pRes.data) setParties(pRes.data);
    if (prRes.data) setProducts(prRes.data);
    setLoading(false);
  }

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  let totalGst = 0;
  items.forEach((item) => {
    const itemTotal = item.qty * item.rate;
    const gstAmt = (itemTotal * (item.gstRate || 0)) / 100;
    totalGst += gstAmt;
  });
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const total = subtotal + totalGst;

  function handleItemChange(index: number, field: string, value: any) {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "qty" || field === "rate") {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }
    if (field === "product_id") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        newItems[index].name = prod.name;
        newItems[index].hsn = prod.hsn_code || "";
        newItems[index].rate = prod.rate;
        newItems[index].gstRate = prod.gst_rate;
      }
    }
    setItems(newItems);
  }

  function addItemRow() {
    setItems([...items, { name: "", qty: 1, rate: 0, gstRate: 18 }]);
  }

  function removeItemRow(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  async function openCreateModal() {
    const nextNo = await generateInvoiceNumber("INV");
    setInvoiceNo(nextNo);
    setSelectedPartyId("");
    setItems([{ name: "", qty: 1, rate: 0, gstRate: 18 }]);
    setNotes("");
    setShowCreate(true);
  }

  async function handleSaveInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedPartyId) return;
    const { error } = await createInvoice({
      invoice_no: invoiceNo,
      party_id: selectedPartyId,
      date,
      due_date: dueDate || null,
      items,
      subtotal,
      cgst,
      sgst,
      igst: 0,
      total,
      status: "sent",
      notes,
      user_id: user.id,
    });
    if (!error) {
      setShowCreate(false);
      loadData();
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading invoices...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        user={user ? { email: user.email || "", name: user.user_metadata?.full_name } : null}
        onSearch={setSearch}
        searchValue={search}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">GST Invoices</h1>
            <p className="text-muted-foreground mt-1">Generate professional tax invoices with auto-filled party details</p>
          </div>
          <Button variant="primary" size="lg" onClick={openCreateModal} className="gap-2">
            <Plus className="h-5 w-5" />
            Create Invoice
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search invoices by number, party, or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {invoices.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-6">Generate your first GST tax invoice with auto-filled party details</p>
              <Button variant="primary" onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border))]">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-5 hover:bg-accent transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg text-foreground">{inv.invoice_no}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            {inv.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{inv.parties?.name || "Unknown Party"}</span>
                          <span>{formatDate(inv.date)}</span>
                          {inv.due_date && <span>Due: {formatDate(inv.due_date)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-xl text-foreground">{formatCurrency(inv.total)}</p>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="View invoice">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More options">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Invoice Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create GST Tax Invoice"
        size="full"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border bg-background font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Party Selection */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Select Party / Customer *</label>
              <Select
                value={selectedPartyId}
                onChange={setSelectedPartyId}
                options={parties.map((p) => ({ label: p.name, value: p.id }))}
                placeholder="-- Choose Party from Master --"
                disabled={!user}
              />
            </div>

            {selectedParty && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-800/50 rounded-lg p-4">
                <div>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Name</p>
                  <p className="font-semibold text-foreground">{selectedParty.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-foreground">{selectedParty.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">GSTIN</p>
                  <p className="font-medium font-mono text-foreground">{selectedParty.gstin || "Unregistered"}</p>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Address</p>
                  <p className="font-medium text-foreground">{selectedParty.address || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Invoice Items</h3>
              <Button variant="outline" size="sm" onClick={addItemRow} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-secondary rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Select
                        value={item.product_id || ""}
                        onChange={(value: string) => handleItemChange(idx, "product_id", value)}
                        options={products.map((p) => ({ label: `${p.name} (₹${p.rate}/${p.unit})`, value: p.id }))}
                        placeholder="-- Pick from Product Master or type below --"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItemRow(idx)} aria-label="Remove item">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Item Name / Description"
                      placeholder="e.g. Steel Rods 10mm"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                      required
                    />
                    <Input
                      label="HSN Code"
                      placeholder="e.g. 7214"
                      value={item.hsn || ""}
                      onChange={(e) => handleItemChange(idx, "hsn", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Input
                      label="Qty"
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, "qty", parseFloat(e.target.value) || 0)}
                      required
                    />
                    <Input
                      label="Rate (₹)"
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", parseFloat(e.target.value) || 0)}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">GST Rate</label>
                      <Select
                        value={String(item.gstRate || 18)}
                        onChange={(value: string) => handleItemChange(idx, "gstRate", parseFloat(value))}
                        options={[
                          { label: "0%", value: "0" },
                          { label: "5%", value: "5" },
                          { label: "12%", value: "12" },
                          { label: "18%", value: "18" },
                          { label: "28%", value: "28" },
                        ]}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full bg-background rounded-xl px-4 py-3 border border-border">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-bold text-lg text-foreground">
                          {formatCurrency((item.qty || 0) * (item.rate || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">CGST (9%)</span>
              <span className="font-medium">{formatCurrency(cgst)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">SGST (9%)</span>
              <span className="font-medium">{formatCurrency(sgst)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
              <span className="text-indigo-600 dark:text-indigo-400">Total Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <Input
            label="Notes / Terms & Conditions"
            placeholder="e.g. Goods once sold will not be taken back. Payment due within 30 days."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save & Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>
      <BottomNav />
    </div>
  );
}