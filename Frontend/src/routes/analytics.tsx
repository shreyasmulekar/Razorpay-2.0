import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, EyeOff, Timer } from "lucide-react";
import { AppShell, StatusPill } from "@/components/app-shell";
import { DashboardError, DashboardNotFound, DashboardSkeleton } from "@/components/dashboard-states";
import { DrilldownButton } from "@/components/drilldown";
import { ExportMenu } from "@/components/export-menu";
import type { Dataset } from "@/lib/report";
import { BarRow, Donut, Sparkline, StackedBar } from "@/components/charts";
import { MultipleLineChart, PaymentOutcomesStackedBarChart } from "@/components/advanced-charts";
import { ExpandCard, ExpandPanel } from "@/components/expandable";
import {
  formatPct,
  incidents,
  methodStats,
  successRateTrend,
  summarize,
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
  pendingComponent: () => <DashboardSkeleton tiles={4} panels={4} />,
  errorComponent: ({ error }) => <DashboardError error={error} view="true success rate" />,
  notFoundComponent: () => <DashboardNotFound view="true success rate" />,
});

const statusTone = {
  open: "warning",
  mitigated: "info",
  resolved: "success",
} as const;

function AnalyticsPage() {
  const s = summarize(methodStats);
  const hidden = s.timeouts + s.abandoned + s.webhookLost;
  const trueSeries = successRateTrend.map((d) => d.trueRate);
  const vanitySeries = successRateTrend.map((d) => d.vanityRate);
  const maxAttempts = Math.max(...methodStats.map((m) => m.attempts));

  const trendDataset: Dataset = {
    title: "Daily true vs reported rate",
    note: "Exact series behind every sparkline on this page.",
    columns: ["Day", "True rate %", "Vanity rate %", "Gap (pp)"],
    rows: successRateTrend.map((d) => [
      d.day,
      +(d.trueRate * 100).toFixed(2),
      +(d.vanityRate * 100).toFixed(2),
      +((d.vanityRate - d.trueRate) * 100).toFixed(2),
    ]),
  };
  const outcomeDataset: Dataset = {
    title: "Outcome of every attempt",
    note: `Denominator = ${s.attempts.toLocaleString("en-IN")} attempts. True rate = successes ÷ all attempts.`,
    columns: ["Outcome", "Attempts", "Share %"],
    rows: [
      ["Success", s.successes],
      ["Issuer declines", s.issuerDeclines],
      ["Our errors", s.gatewayErrors],
      ["Timeouts", s.timeouts],
      ["Abandoned", s.abandoned],
      ["Webhook lost", s.webhookLost],
    ].map(([l, v]) => [l as string, v as number, +(((v as number) / s.attempts) * 100).toFixed(2)]),
  };
  const hiddenDataset: Dataset = {
    title: "Attempts excluded by vanity math",
    note: "These are removed from the denominator on a conventional dashboard.",
    columns: ["Failure type", "Attempts", "Share of hidden %"],
    rows: [
      ["Timeouts", s.timeouts],
      ["Abandoned", s.abandoned],
      ["Webhook lost", s.webhookLost],
    ].map(([l, v]) => [l as string, v as number, +(((v as number) / (hidden || 1)) * 100).toFixed(2)]),
  };
  const methodDataset: Dataset = {
    title: "Breakdown by payment method",
    columns: [
      "Method",
      "Attempts",
      "Successes",
      "Issuer declines",
      "Our errors",
      "Timeouts",
      "Abandoned",
      "Webhook lost",
      "p95 latency (ms)",
      "True rate %",
    ],
    rows: methodStats.map((m) => [
      m.method,
      m.attempts,
      m.successes,
      m.issuerDeclines,
      m.gatewayErrors,
      m.timeouts,
      m.abandoned,
      m.webhookLost,
      m.p95LatencyMs,
      +((m.successes / m.attempts) * 100).toFixed(2),
    ]),
  };
  const incidentDataset: Dataset = {
    title: "Incidents",
    columns: ["Surface", "Window", "Impact", "Status", "Detail"],
    rows: incidents.map((i) => [i.surface, i.window, i.impact, i.status, i.detail]),
  };
  const allDatasets = [
    outcomeDataset,
    trendDataset,
    hiddenDataset,
    methodDataset,
    incidentDataset,
  ];

  return (
    <AppShell
      title="True success rate"
      subtitle="Headline numbers first. Click a tile or a payment method to unfold exactly which attempts failed and who caused it."
      actions={
        <ExportMenu
          title="True success rate"
          subtitle="Attempt-weighted payment performance — every timeout, abandonment and lost webhook counted."
          filename="clarity-true-success-rate"
          datasets={allDatasets}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExpandCard
          label="True success rate"
          value={formatPct(s.trueRate)}
          note={`${s.successes.toLocaleString("en-IN")} of ${s.attempts.toLocaleString("en-IN")} attempts`}
          icon={Activity}
          tone="text-success"
          preview={<Sparkline values={trueSeries} className="text-success" />}
        >
          <p className="eyebrow">Outcome of every attempt</p>
          <div className="mt-4">
            <StackedBar
              parts={[
                { label: "Success", value: s.successes, className: "bg-success" },
                { label: "Issuer declines", value: s.issuerDeclines, className: "bg-info" },
                { label: "Our errors", value: s.gatewayErrors, className: "bg-destructive" },
                { label: "Timeouts", value: s.timeouts, className: "bg-warning" },
                { label: "Abandoned", value: s.abandoned, className: "bg-muted-foreground" },
                { label: "Webhook lost", value: s.webhookLost, className: "bg-chart-5" },
              ]}
            />
          </div>
          <DrilldownButton
            title="True success rate — underlying numbers"
            description="Every attempt in the denominator, plus the daily series behind the sparkline."
            datasets={[outcomeDataset, trendDataset]}
          />
        </ExpandCard>

        <ExpandCard
          label="Vanity rate (what others report)"
          value={formatPct(s.vanityRate)}
          note="Excludes timeouts & abandonment"
          icon={EyeOff}
          tone="text-muted-foreground"
          preview={
            <Sparkline values={vanitySeries} className="text-muted-foreground" area={false} />
          }
        >
          <p className="text-xs text-surface-foreground">
            Conventional dashboards divide successes by successes plus explicit failures. Every
            silent failure simply disappears from the maths.
          </p>
          <div className="mt-4 flex items-center gap-5">
            <Donut
              size={112}
              centerLabel={formatPct(s.vanityRate)}
              centerSub="reported"
              segments={[
                { label: "Counted", value: s.successes + s.issuerDeclines + s.gatewayErrors, className: "text-primary" },
                { label: "Dropped", value: hidden, className: "text-warning" },
              ]}
            />
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-primary" /> Counted attempts
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-warning" /> Silently dropped
              </li>
            </ul>
          </div>
          <DrilldownButton
            title="Vanity rate — what gets dropped"
            description="Counted vs silently discarded attempts, and the daily reported rate."
            datasets={[hiddenDataset, trendDataset]}
          />
        </ExpandCard>

        <ExpandCard
          label="Attempts hidden by that math"
          value={hidden.toLocaleString("en-IN")}
          note={`${s.timeouts} timeouts · ${s.abandoned} abandoned · ${s.webhookLost} webhook-lost`}
          icon={AlertTriangle}
          tone="text-warning-foreground"
          preview={
            <Sparkline
              values={successRateTrend.map((d) => d.vanityRate - d.trueRate)}
              className="text-warning"
            />
          }
        >
          <p className="eyebrow">Hidden failures by type</p>
          <div className="mt-3 space-y-2.5">
            <BarRow label="Timeouts" value={s.timeouts} max={hidden} display={String(s.timeouts)} className="bg-warning" />
            <BarRow label="Abandoned" value={s.abandoned} max={hidden} display={String(s.abandoned)} className="bg-muted-foreground" />
            <BarRow label="Webhook lost" value={s.webhookLost} max={hidden} display={String(s.webhookLost)} className="bg-chart-5" />
          </div>
          <DrilldownButton
            title="Hidden failures — exact counts"
            description="The attempts a conventional dashboard removes from the maths, by type and by method."
            datasets={[hiddenDataset, methodDataset]}
          />
        </ExpandCard>

        <ExpandCard
          label="Gap between the two"
          value={`${((s.vanityRate - s.trueRate) * 100).toFixed(1)}pp`}
          note="Revenue you were told you didn't lose"
          icon={Timer}
          tone="text-primary"
          preview={
            <Sparkline values={successRateTrend.map((d) => d.trueRate)} className="text-primary" />
          }
        >
          <p className="eyebrow">Daily gap, last 7 days</p>
          <div className="mt-3 space-y-2.5">
            {successRateTrend.map((d) => (
              <BarRow
                key={d.day}
                label={d.day}
                value={d.vanityRate - d.trueRate}
                max={Math.max(...successRateTrend.map((x) => x.vanityRate - x.trueRate))}
                display={`${((d.vanityRate - d.trueRate) * 100).toFixed(1)}pp`}
              />
            ))}
          </div>
          <DrilldownButton
            title="True vs reported gap, day by day"
            description="Hover the chart for each day's exact true rate, reported rate and gap."
            datasets={[trendDataset]}
          />
        </ExpandCard>
      </div>

      <div className="mt-6 grid gap-6">
        <ExpandPanel
          title="True vs reported, last 7 days"
          summary="The dotted line is the number a conventional gateway dashboard would show you"
          badge={<StatusPill tone="info">Attempt-weighted</StatusPill>}
        >
          <div className="flex items-end gap-3">
            {successRateTrend.map((d) => {
              const floor = 0.7;
              const scale = (v: number) =>
                Math.max(6, Math.round(((v - floor) / (1 - floor)) * 192));
              return (
                <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-48 w-full items-end justify-center">
                    <div
                      className="w-1/2 rounded-t-md bg-primary/85 transition-colors group-hover:bg-primary"
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
          <DrilldownButton
            title="Daily series"
            description="The exact values plotted above, with per-day tooltips."
            datasets={[trendDataset]}
          />
        </ExpandPanel>

        <section>
          <h2 className="text-base font-semibold">Breakdown by method</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a method to see who caused each failure: the issuer, us, or a silent timeout.
          </p>
          <div className="mt-4 grid gap-3">
            {methodStats.map((m) => {
              const rate = m.successes / m.attempts;
              return (
                <ExpandPanel
                  key={m.method}
                  title={m.method}
                  summary={
                    <span className="flex items-center gap-3">
                      <span className="num">{m.attempts.toLocaleString("en-IN")} attempts</span>
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface">
                        <span
                          className={`block h-full rounded-full ${
                            rate < 0.8 ? "bg-warning" : "bg-success"
                          }`}
                          style={{ width: `${Math.round(rate * 100)}%` }}
                        />
                      </span>
                    </span>
                  }
                  badge={
                    <span
                      className={`num text-sm font-semibold ${
                        rate < 0.8 ? "text-warning-foreground" : "text-success"
                      }`}
                    >
                      {formatPct(rate)}
                    </span>
                  }
                >
                  <StackedBar
                    parts={[
                      { label: "Success", value: m.successes, className: "bg-success" },
                      { label: "Issuer declines", value: m.issuerDeclines, className: "bg-info" },
                      { label: "Our errors", value: m.gatewayErrors, className: "bg-destructive" },
                      { label: "Timeouts", value: m.timeouts, className: "bg-warning" },
                      { label: "Abandoned", value: m.abandoned, className: "bg-muted-foreground" },
                      { label: "Webhook lost", value: m.webhookLost, className: "bg-chart-5" },
                    ]}
                  />
                  <div className="mt-5 space-y-2.5">
                    <BarRow
                      label="Attempts"
                      value={m.attempts}
                      max={maxAttempts}
                      display={m.attempts.toLocaleString("en-IN")}
                    />
                    <BarRow
                      label="p95 latency"
                      value={m.p95LatencyMs}
                      max={Math.max(...methodStats.map((x) => x.p95LatencyMs))}
                      display={`${(m.p95LatencyMs / 1000).toFixed(1)}s`}
                      className="bg-info"
                    />
                  </div>
                  <DrilldownButton
                    title={`${m.method} — attempt-level aggregates`}
                    description="Every outcome bucket used to compute this method's true rate."
                    datasets={[
                      {
                        title: `${m.method} outcomes`,
                        note: `True rate = ${m.successes.toLocaleString("en-IN")} ÷ ${m.attempts.toLocaleString("en-IN")} = ${formatPct(m.successes / m.attempts)}`,
                        columns: ["Outcome", "Attempts", "Share %"],
                        rows: (
                          [
                            ["Success", m.successes],
                            ["Issuer declines", m.issuerDeclines],
                            ["Our errors", m.gatewayErrors],
                            ["Timeouts", m.timeouts],
                            ["Abandoned", m.abandoned],
                            ["Webhook lost", m.webhookLost],
                          ] as [string, number][]
                        ).map(([l, v]) => [l, v, +((v / m.attempts) * 100).toFixed(2)]),
                      },
                      methodDataset,
                    ]}
                  />
                </ExpandPanel>
              );
            })}
          </div>
        </section>

        {/* ── Advanced Visualizations Section ── */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold">True vs Vanity Rate Clearance</h2>
                <p className="text-xs text-muted-foreground">Multiple line chart tracking rate divergence</p>
              </div>
              <StatusPill tone="warning">Multiple Lines</StatusPill>
            </div>
            <div className="mt-4">
              <MultipleLineChart height={270} />
            </div>
          </div>
          <div className="panel p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold">Daily Outcome Distribution</h2>
                <p className="text-xs text-muted-foreground">Stacked bar chart of all attempt outcomes</p>
              </div>
              <StatusPill tone="info">Stacked Bar</StatusPill>
            </div>
            <div className="mt-4">
              <PaymentOutcomesStackedBarChart height={270} />
            </div>
          </div>
        </section>

        <ExpandPanel

          title="Incidents behind the dips"
          summary={`${incidents.length} logged incidents with impact and status`}
        >
          <div className="grid gap-4">
            {incidents.map((i) => (
              <article key={i.id} className="rounded-lg border border-border bg-surface p-5">
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
          </div>
          <DrilldownButton
            title="Incident log"
            description="Every logged incident with window, impact and status."
            datasets={[incidentDataset]}
          />
        </ExpandPanel>
      </div>
    </AppShell>
  );
}
