import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, EyeOff, RefreshCw, Timer } from "lucide-react";
import { AppShell, StatusPill } from "@/components/app-shell";
import { useState, useEffect } from "react";
import {
  formatPct,
  incidents,
  methodStats,
  successRateTrend,
} from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "True Success Rate — Clarity Payments" },
      {
        name: "description",
        content:
          "Payment success measured against every attempt — timeouts, abandoned redirects and lost webhooks included, never dropped from the denominator.",
      },
      { property: "og:title", content: "True Success Rate — Clarity Payments" },
      {
        property: "og:description",
        content:
          "Every attempt in the denominator: timeouts, abandonments and lost webhooks counted, not hidden.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const statusTone = {
  open: "warning",
  mitigated: "info",
  resolved: "success",
} as const;

function AnalyticsPage() {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live analytics from the Python FastAPI Backend
  const fetchHonestMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/v1/analytics/success-rate");
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
      }
    } catch (error) {
      console.error("FastAPI Backend is not running!", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHonestMetrics();
  }, []);

  // Map the FastAPI response to your UI Cards
  const trueRate = liveData ? liveData.true_performance.success_rate_percentage : 0;
  const vanityRate = liveData ? liveData.legacy_dashboard_comparison.inflated_success_rate_percentage : 0;
  const hiddenTimeouts = liveData ? liveData.true_performance.silent_timeouts_captured : 0;
  const varianceGap = liveData ? liveData.legacy_dashboard_comparison.hidden_failure_variance : 0;
  const totalIntents = liveData ? liveData.true_performance.total_checkout_intents : 0;

  const cards = [
    {
      label: "True success rate",
      value: `${trueRate}%`,
      note: `Based on ${totalIntents} total system intents`,
      icon: Activity,
      tone: "text-success",
    },
    {
      label: "Legacy Vanity Rate",
      value: `${vanityRate}%`,
      note: "What traditional gateways report",
      icon: EyeOff,
      tone: "text-muted-foreground",
    },
    {
      label: "Silent Timeouts Captured",
      value: hiddenTimeouts,
      note: "Hidden failures caught by our ledger",
      icon: AlertTriangle,
      tone: "text-warning-foreground",
    },
    {
      label: "Hidden Failure Gap",
      value: `${varianceGap}%`,
      note: "Revenue loss you were blind to",
      icon: Timer,
      tone: "text-primary",
    },
  ];

  return (
    <AppShell
      title="True success rate"
      subtitle="Powered by Live FastAPI Engine. Every initiated attempt stays in the denominator. Timeouts and dropped webhooks are failures — not rounding errors."
    >
      <div className="flex items-center justify-between mb-4">
        <StatusPill tone="info">Live Database Connection</StatusPill>
        <button 
          onClick={fetchHonestMetrics}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Fetch Live Metrics
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{label}</p>
              <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <p className="num mt-3 text-3xl font-bold">{loading ? "..." : value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <section className="panel mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">True vs reported, last 7 days</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The dotted line is the number a conventional gateway dashboard would show
              you.
            </p>
          </div>
          <StatusPill tone="info">Attempt-weighted</StatusPill>
        </div>

        <div className="mt-8 flex items-end gap-3">
          {successRateTrend.map((d) => {
            const floor = 0.7;
            const scale = (v: number) =>
              Math.max(6, Math.round(((v - floor) / (1 - floor)) * 192));
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-48 w-full items-end justify-center">
                  <div
                    className="w-1/2 rounded-t-md bg-primary/85"
                    style={{ height: `${scale(d.trueRate)}px` }}
                    title={`True ${formatPct(d.trueRate)}`}
                  />
                  <div
                    className="absolute left-1/2 w-1/2 -translate-x-1/2 border-t-2 border-dashed border-muted-foreground/70"
                    style={{ bottom: `${scale(d.vanityRate)}px` }}
                    title={`Reported ${formatPct(d.vanityRate)}`}
                  />
                </div>
                <span className="num text-[11px] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> True rate
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-muted-foreground" />{" "}
            Vanity rate
          </span>
          <span className="num ml-auto text-muted-foreground">Scale 70–100%</span>
        </div>
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-border p-6">
          <h2 className="text-base font-semibold">Breakdown by method</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Failures split by who caused them: the issuer, us, or a silent timeout.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="eyebrow px-6 py-3 font-semibold">Method</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">Attempts</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">True rate</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">
                  Issuer declines
                </th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">Our errors</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">Timeouts</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">
                  Webhook lost
                </th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">p95</th>
              </tr>
            </thead>
            <tbody>
              {methodStats.map((m) => {
                const rate = m.successes / m.attempts;
                return (
                  <tr key={m.method} className="border-b border-border last:border-0">
                    <td className="px-6 py-3.5 font-medium">{m.method}</td>
                    <td className="num px-6 py-3.5 text-right">
                      {m.attempts.toLocaleString("en-IN")}
                    </td>
                    <td
                      className={`num px-6 py-3.5 text-right font-semibold ${
                        rate < 0.8 ? "text-warning-foreground" : "text-success"
                      }`}
                    >
                      {formatPct(rate)}
                    </td>
                    <td className="num px-6 py-3.5 text-right text-muted-foreground">
                      {m.issuerDeclines}
                    </td>
                    <td className="num px-6 py-3.5 text-right text-muted-foreground">
                      {m.gatewayErrors}
                    </td>
                    <td className="num px-6 py-3.5 text-right">{m.timeouts}</td>
                    <td className="num px-6 py-3.5 text-right">{m.webhookLost}</td>
                    <td className="num px-6 py-3.5 text-right text-muted-foreground">
                      {(m.p95LatencyMs / 1000).toFixed(1)}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        <h2 className="text-base font-semibold">Incidents behind the dips</h2>
        {incidents.map((i) => (
          <article key={i.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl">
                <StatusPill tone={statusTone[i.status]}>{i.status}</StatusPill>
                <h3 className="mt-2.5 text-sm font-semibold">{i.surface}</h3>
                <p className="mt-1 text-sm text-surface-foreground">{i.detail}</p>
              </div>
              <div className="text-right">
                <p className="num text-xs text-muted-foreground">{i.window}</p>
                <p className="mt-1 text-xs font-medium">{i.impact}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}