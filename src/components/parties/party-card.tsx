"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Building2, MoreVertical, Trash2, Edit, MessageSquare } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown";

interface Party {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  address?: string | null;
  type: "customer" | "supplier";
  balance: number;
  txCount: number;
  createdAt: string;
}

interface PartyCardProps {
  party: Party;
  onClick?: () => void;
  onEdit?: (party: Party) => void;
  onDelete?: (id: string) => void;
  onMessage?: (party: Party) => void;
  delay?: number;
}

export function PartyCard({
  party,
  onClick,
  onEdit,
  onDelete,
  onMessage,
  delay = 0,
}: PartyCardProps) {
  const isPositive = party.balance > 0;
  const isNegative = party.balance < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-lg", onClick && "cursor-pointer")}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {party.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground] truncate">
                    {party.name}
                  </h3>
                  <Badge variant={party.type === "customer" ? "success" : "secondary"}>
                    {party.type === "customer" ? "Customer" : "Supplier"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground]">
                  {party.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {party.phone}
                    </span>
                  )}
                  {party.gstin && (
                    <span className="flex items-center gap-1 font-mono text-xs">
                      <Building2 className="h-3.5 w-3.5" />
                      {party.gstin}
                    </span>
                  )}
                </div>
                {party.address && (
                  <p className="mt-1 text-xs text-muted-foreground] truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {party.address}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground]">
                  <span>{party.txCount} transactions</span>
                  <span className="text-[rgb(var(--border))]">•</span>
                  <span>{new Date(party.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Balance & Actions */}
            <div className="flex flex-col items-end gap-2 min-w-[140px]">
              <div
                className={cn(
                  "font-bold text-lg",
                  isPositive && "text-emerald-600 dark:text-emerald-400",
                  isNegative && "text-red-600 dark:text-red-400",
                  !isPositive && !isNegative && "text-slate-500"
                )}
              >
                {isPositive
                  ? `+${formatCurrency(party.balance)}`
                  : isNegative
                  ? formatCurrency(party.balance)
                  : formatCurrency(0)}
              </div>
              <div
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  isPositive && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  isNegative && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  !isPositive && !isNegative && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {isPositive ? "You'll Get" : isNegative ? "You'll Give" : "Settled"}
              </div>

              <DropdownMenu
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
                items={[
                  { label: "View Ledger", value: "view", icon: <MessageSquare className="h-4 w-4" /> },
                  { label: "Edit Party", value: "edit", icon: <Edit className="h-4 w-4" /> },
                  { label: "Send Reminder", value: "remind", icon: <Phone className="h-4 w-4" /> },
                  { divider: true },
                  { label: "Delete", value: "delete", icon: <Trash2 className="h-4 w-4" /> },
                ]}
                onSelect={(value) => {
                  switch (value) {
                    case "edit":
                      onEdit?.(party);
                      break;
                    case "delete":
                      onDelete?.(party.id);
                      break;
                    case "remind":
                      onMessage?.(party);
                      break;
                    default:
                      onClick?.();
                  }
                }}
                align="end"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PartyList({
  parties,
  onPartyClick,
  onEdit,
  onDelete,
  onMessage,
  emptyMessage = "No parties found",
}: {
  parties: Party[];
  onPartyClick?: (party: Party) => void;
  onEdit?: (party: Party) => void;
  onDelete?: (id: string) => void;
  onMessage?: (party: Party) => void;
  emptyMessage?: string;
}) {
  if (parties.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-12 w-12 text-muted-foreground]" />}
        title="No parties yet"
        description={emptyMessage}
        action={{
          label: "Add your first party",
          onClick: () => onEdit?.({} as Party),
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {parties.map((party, index) => (
        <PartyCard
          key={party.id}
          party={party}
          onClick={() => onPartyClick?.(party)}
          onEdit={onEdit}
          onDelete={onDelete}
          onMessage={onMessage}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}

import { EmptyState } from "@/components/ui/empty-state";