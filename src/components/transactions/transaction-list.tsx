"use client";

import { motion } from "framer-motion";
import { MoreVertical, Trash2, Edit, FileText } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown";

interface Transaction {
  id: string;
  partyId: string;
  partyName?: string;
  amount: number;
  type: "gave" | "got";
  date: string;
  note?: string | null;
  billNo?: string | null;
  createdAt: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onView?: (tx: Transaction) => void;
  delay?: number;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  onView,
  delay = 0,
}: TransactionItemProps) {
  const isGot = transaction.type === "got";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      <div className="bg-card] border border-border] rounded-xl p-4 hover:bg-accent] transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              isGot
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {isGot ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground] truncate">
                  {transaction.partyName || "Unknown Party"}
                </p>
                {transaction.billNo && (
                  <Badge variant="outline" className="text-xs">
                    Bill: {transaction.billNo}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground]">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(transaction.date)}
                </span>
                {transaction.note && (
                  <span className="truncate max-w-[200px]">{transaction.note}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className={cn(
                "font-bold text-lg",
                isGot ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
                {isGot ? "+" : "-"} {formatCurrency(transaction.amount)}
              </p>
              <p className={cn("text-xs font-medium", isGot ? "text-emerald-600" : "text-red-600")}>
                {isGot ? "Received" : "Paid"}
              </p>
            </div>

            <DropdownMenu
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
              items={[
                { label: "View Details", value: "view", icon: <FileText className="h-4 w-4" /> },
                { label: "Edit", value: "edit", icon: <Edit className="h-4 w-4" /> },
                { divider: true },
                { label: "Delete", value: "delete", icon: <Trash2 className="h-4 w-4" /> },
              ]}
              onSelect={(value) => {
                switch (value) {
                  case "edit":
                    onEdit?.(transaction);
                    break;
                  case "delete":
                    onDelete?.(transaction.id);
                    break;
                  default:
                    onView?.(transaction);
                }
              }}
              align="end"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "No transactions yet",
}: {
  transactions: Transaction[];
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onView?: (tx: Transaction) => void;
  emptyMessage?: string;
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-12 w-12 text-muted-foreground]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No transactions yet"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          delay={index * 0.03}
        />
      ))}
    </div>
  );
}

import { EmptyState } from "@/components/ui/empty-state";