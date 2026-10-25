import { Suspense } from "react";
import PartyDetail from "./party-content";

export default function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PartyDetail params={params} />
    </Suspense>
  );
}