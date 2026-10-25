"use client";

import { useState } from "react";
import { createTransaction, deleteTransaction } from "../lib/db";
import {
  Plus,
  Trash2,
  Calendar,
  FileText,
  IndianRupee,
  Receipt,
} from "lucide-react";

interface Transaction {
  id?: string;
  partyId: string;
  userId: string;
  amount?: number;
  type?: "gave" | "got";
  date?: string;
  note?: string;
  bill_no?: string;
}

interface TransactionListProps {
  partyId: string;
  userId: string;
  transactions: any[];
  onUpdated: () => void;
}

export function TransactionCard({ partyId, userId, onUpdated }: TransactionListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"gave" | "got">("gave");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [billNo, setBillNo] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    const { error } = await createTransaction({
      party_id: partyId,
      user_id: userId,
      amount: parseFloat(amount),
      type,
      date,
      note,
      bill_no: billNo,
    });
    if (!error) {
      setShowAdd(false);
      setAmount("");
      setNote("");
      setBillNo("");
      onUpdated();
    }
  }

  return (
    <div className="space-y-3 no-print">
      <button
        onClick={() => setShowAdd(true)}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-[1.02]"
      >
        <Plus className="w-5 h-5" /> Record Bill / Payment
      </button>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full max-w-md rounded-t-[28px] p-6 space-y-4 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Bill / Payment</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("got")}
                  className={`py-3 px-4 rounded-xl font-semibold border transition-all ${
                    type === "got"
                      ? "bg-green-50 border-green-300 text-green-800 scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  You Got (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType("gave")}
                  className={`py-3 px-4 rounded-xl font-semibold border transition-all ${
                    type === "gave"
                      ? "bg-red-50 border-red-300 text-red-800 scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  You Gave (-)
                </button>
              </div>

              <div className="relative">
                <IndianRupee className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-right"
                  autoFocus
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <Receipt className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Bill Number"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Notes / Description"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 transition transform hover:scale-[1.02]"
              >
                Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}