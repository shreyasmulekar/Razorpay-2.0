import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface MethodStatsRow {
  method: string;
  attempts: number;
  successes: number;
  issuerDeclines: number;
  gatewayErrors: number;
  timeouts: number;
  abandoned: number;
  webhookLost: number;
  p95LatencyMs: number;
}

export interface DailyRateRow {
  day: string;
  trueRate: number;
  vanityRate: number;
}

export interface SuccessRatePayload {
  methods: MethodStatsRow[];
  trend: DailyRateRow[];
}

function serverSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/**
 * True success rate, computed server-side from every recorded attempt.
 * Nothing is dropped from the denominator.
 */
export const getTrueSuccessRate = createServerFn({ method: "GET" }).handler(
  async (): Promise<SuccessRatePayload> => {
    const supabase = serverSupabase();

    const [methodsRes, dailyRes] = await Promise.all([
      supabase.from("payment_method_stats").select("*"),
      supabase.from("payment_daily_stats").select("*").order("day"),
    ]);

    if (methodsRes.error) throw new Error(methodsRes.error.message);
    if (dailyRes.error) throw new Error(dailyRes.error.message);

    const methods: MethodStatsRow[] = (methodsRes.data ?? [])
      .map((r) => ({
        method: r.method ?? "Unknown",
        attempts: Number(r.attempts ?? 0),
        successes: Number(r.successes ?? 0),
        issuerDeclines: Number(r.issuer_declines ?? 0),
        gatewayErrors: Number(r.gateway_errors ?? 0),
        timeouts: Number(r.timeouts ?? 0),
        abandoned: Number(r.abandoned ?? 0),
        webhookLost: Number(r.webhook_lost ?? 0),
        p95LatencyMs: Number(r.p95_latency_ms ?? 0),
      }))
      .sort((a, b) => b.attempts - a.attempts);

    const trend: DailyRateRow[] = (dailyRes.data ?? []).map((r) => {
      const attempts = Number(r.attempts ?? 0);
      const successes = Number(r.successes ?? 0);
      const explicit = Number(r.explicit_failures ?? 0);
      return {
        day: new Date(`${r.day}T00:00:00Z`).toLocaleDateString("en-IN", {
          timeZone: "UTC",
          day: "2-digit",
          month: "short",
        }),
        trueRate: attempts ? successes / attempts : 0,
        vanityRate: successes + explicit ? successes / (successes + explicit) : 0,
      };
    });

    return { methods, trend };
  },
);
