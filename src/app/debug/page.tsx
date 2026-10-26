"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { getParties, createParty } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [results, setResults] = useState<string[]>([]);
  const [testPartyName, setTestPartyName] = useState("Test Party");

  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const testConnection = async () => {
    log("Testing Supabase connection...");
    try {
      const { data, error } = await supabase.from("parties").select("count", { count: "exact", head: true });
      if (error) {
        log(`❌ Connection failed: ${error.message} (code: ${error.code})`);
      } else {
        log(`✅ Connection OK - parties table accessible`);
      }
    } catch (e: any) {
      log(`❌ Exception: ${e.message}`);
    }
  };

  const testAuth = async () => {
    log("Testing auth state...");
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      log(`❌ Auth error: ${error.message}`);
    } else if (session) {
      log(`✅ Session exists - user: ${session.user.email} (${session.user.id})`);
    } else {
      log(`⚠️ No active session`);
    }
  };

  const testCreateParty = async () => {
    if (!user) {
      log("❌ No user logged in");
      return;
    }
    log(`Attempting to create party: ${testPartyName}`);
    try {
      const { data, error } = await createParty({
        name: testPartyName,
        phone: "9876543210",
        type: "customer",
        user_id: user.id,
      });
      if (error) {
        log(`❌ Create party failed: ${error.message} (code: ${error.code})`);
      } else {
        log(`✅ Party created: ${data?.id}`);
      }
    } catch (e: any) {
      log(`❌ Exception: ${e.message}`);
    }
  };

  const testFetchParties = async () => {
    if (!user) {
      log("❌ No user logged in");
      return;
    }
    log("Fetching parties...");
    try {
      const { data, error } = await getParties();
      if (error) {
        log(`❌ Fetch failed: ${error.message} (code: ${error.code})`);
      } else {
        log(`✅ Fetched ${data?.length || 0} parties`);
        if (data?.length) {
          log(`   First: ${data[0].name} (user_id: ${data[0].user_id})`);
        }
      }
    } catch (e: any) {
      log(`❌ Exception: ${e.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading auth...</div>;
  if (!user) return <div className="p-8 text-center text-red-600">Not logged in. <a href="/login">Login first</a></div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Panel</h1>
      <div className="grid gap-4 max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">User Info</h2>
          <pre className="text-xs bg-background p-3 rounded">{JSON.stringify(user, null, 2)}</pre>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Connection Tests</h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={testConnection}>Test DB Connection</Button>
            <Button variant="secondary" onClick={testAuth}>Test Auth Session</Button>
            <Button variant="secondary" onClick={testFetchParties}>Fetch Parties</Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Write Test</h2>
          <Input
            label="Party Name"
            value={testPartyName}
            onChange={(e) => setTestPartyName(e.target.value)}
            className="mb-2"
          />
          <Button onClick={testCreateParty}>Create Test Party</Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Logs</h2>
          <pre className="text-xs bg-background p-3 rounded max-h-96 overflow-auto text-left">
            {results.length === 0 ? "Click a test button above..." : results.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}