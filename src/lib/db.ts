import { supabase } from "./supabase";
import type { Database } from "../types/database";

type Party = Database["public"]["Tables"]["parties"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

type PartyInsert = Database["public"]["Tables"]["parties"]["Insert"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];

// Parties
export async function getParties() {
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .order("name");
  return { data, error };
}

export async function getParty(id: string) {
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function createParty(p: PartyInsert) {
  const { data, error } = await supabase.from("parties").insert(p).select().single();
  return { data, error };
}

export async function updateParty(id: string, p: Partial<PartyInsert>) {
  const { data, error } = await supabase
    .from("parties")
    .update(p)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteParty(id: string) {
  const { error } = await supabase.from("parties").delete().eq("id", id);
  return { error };
}

// Transactions
export async function getTransactions(partyId?: string) {
  let q = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (partyId) q = q.eq("party_id", partyId);
  const { data, error } = await q;
  return { data, error };
}

export async function createTransaction(t: TransactionInsert) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(t)
    .select()
    .single();
  return { data, error };
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  return { error };
}

// Products
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  return { data, error };
}

export async function createProduct(p: ProductInsert) {
  const { data, error } = await supabase.from("products").insert(p).select().single();
  return { data, error };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}

// Invoices
export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, parties(name, phone, address, gstin, state)")
    .order("date", { ascending: false });
  return { data, error };
}

export async function getInvoice(id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, parties(name, phone, address, gstin, state)")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function createInvoice(inv: InvoiceInsert) {
  const { data, error } = await supabase
    .from("invoices")
    .insert(inv)
    .select()
    .single();
  return { data, error };
}

export async function updateInvoice(id: string, inv: Partial<InvoiceInsert>) {
  const { data, error } = await supabase
    .from("invoices")
    .update(inv)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  return { error };
}

// Company settings (stored in localStorage for simplicity)
export function getCompanySettings() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("khatabook_company");
  return raw ? JSON.parse(raw) : null;
}

export function saveCompanySettings(s: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("khatabook_company", JSON.stringify(s));
}

// Invoice number generation
export async function generateInvoiceNumber(prefix: string = "INV") {
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_no")
    .like("invoice_no", `${prefix}-%`)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${prefix}-${y}${m}-0001`;
  }
  const last = data[0].invoice_no;
  const parts = last.split("-");
  const num = parseInt(parts[parts.length - 1], 10) + 1;
  return `${prefix}-${num.toString().padStart(4, "0")}`;
}