"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Wallet, CreditCard } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color: "give" | "get" | "neutral";
  delay?: number;
}

export function SummaryCard({ title, amount, icon, trend = "neutral", trendLabel, color, delay = 0 }: SummaryCardProps) {
  const colors = {
    give: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-100 dark:border-red-900/30",
      text: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      trendUp: "text-red-600",
      trendDown: "text-emerald-600",
    },
    get: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      trendUp: "text-emerald-600",
      trendDown: "text-red-600",
    },
    neutral: {
      bg: "bg-slate-50 dark:bg-slate-800/50",
      border: "border-slate-100 dark:border-slate-700",
      text: "text-slate-600 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800",
      trendUp: "text-emerald-600",
      trendDown: "text-red-600",
    },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className={cn("overflow-hidden", c.bg, c.border)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground] uppercase tracking-wider mb-2">
                {title}
              </p>
              <p className={cn("text-3xl font-bold tracking-tight", c.text)}>
                {formatCurrency(amount)}
              </p>
              {trendLabel && (
                <div className="flex items-center gap-1 mt-2">
                  {trend === "up" ? (
                    <TrendingUp className={cn("h-4 w-4", c.trendUp)} />
                  ) : trend === "down" ? (
                    <TrendingDown className={cn("h-4 w-4", c.trendDown)} />
                  ) : null}
                  <span className={cn("text-sm font-medium", c.trendUp)}>{trendLabel}</span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", c.iconBg)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardSummary({
  totalGive,
  totalGet,
  totalParties,
  totalTransactions,
}: {
  totalGive: number;
  totalGet: number;
  totalParties: number;
  totalTransactions: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <SummaryCard
        title="You'll Give"
        amount={totalGive}
        icon={<ArrowUpRight className="h-6 w-6 text-red-600 dark:text-red-400" />}
        trend="up"
        trendLabel="2.3% vs last month"
        color="give"
        delay={0}
      />
      <SummaryCard
        title="You'll Get"
        amount={totalGet}
        icon={<ArrowDownLeft className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        trend="up"
        trendLabel="5.1% vs last month"
        color="get"
        delay={0.1}
      />
      <SummaryCard
        title="Total Parties"
        amount={totalParties}
        icon={<Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        color="neutral"
        delay={0.2}
      />
      <SummaryCard
        title="Transactions"
        amount={totalTransactions}
        icon={<CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
        color="neutral"
        delay={0.3}
      />
    </div>
  );
}