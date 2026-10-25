"use client";

export default function PartySkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-3 border-b last:border-0">
          <div className="w-12 h-12 rounded-full bg-slate-200"></div>
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="text-right space-y-1">
            <div className="h-5 bg-slate-200 rounded w-20 ml-auto"></div>
            <div className="h-3 bg-slate-200 rounded w-12 ml-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-200 rounded w-24"></div>
            <div className="h-5 bg-slate-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-slate-200 rounded w-3/4 mt-2"></div>
        </div>
      ))}
    </div>
  );
}