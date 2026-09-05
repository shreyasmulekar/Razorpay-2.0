import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  GitCommit,
  Clock,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";
import { AppShell, StatusPill } from "@/components/app-shell";
import {
  PaymentOutcomesStackedBarChart,
  PaymentMethodsPieChart,
  LatencyLineChart,
  MultipleLineChart,
  CumulativeVolumeAreaChart,
  StackedAreaChart,
  RiskRadarChart,
  MoneyFlowSankeyChart,
} from "@/components/advanced-charts";

export const Route = createFileRoute("/charts")({
  head: () => ({
    meta: [
      { title: "Visual Analytics & Intelligence — Clarity Payments" },
      {
        name: "description",
        content:
          "Interactive visual analytics: Stacked Bar, Pie, Line, Multiple Line, Area, Stacked Area, Radar, and Sankey money flow diagrams.",
      },
    ],
  }),
  component: ChartsPage,
});

type ChartTab = "all" | "flow" | "performance" | "distribution";

function ChartsPage() {
  const [activeTab, setActiveTab] = useState<ChartTab>("all");
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  const showSankey = activeTab === "all" || activeTab === "flow";
  const showStackedBar = activeTab === "all" || activeTab === "performance";
  const showPie = activeTab === "all" || activeTab === "distribution";
  const showMultiLine = activeTab === "all" || activeTab === "performance";
  const showLatency = activeTab === "all" || activeTab === "performance";
  const showArea = activeTab === "all" || activeTab === "distribution";
  const showStackedArea = activeTab === "all" || activeTab === "flow";
  const showRadar = activeTab === "all" || activeTab === "distribution";

  return (
    <AppShell
      title="Visual Analytics & Intelligence"
      subtitle="Comprehensive graphical breakdown across all financial dimensions: flow topologies, performance curves, risk radars, and volume distributions."
      actions={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-surface p-0.5 text-xs">
            <button
              onClick={() => setTimeRange("7d")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
          </div>
          <StatusPill tone="success">
            <Sparkles className="h-3 w-3 mr-1 inline" /> Live Metrics
          </StatusPill>
        </div>
      }
    >
      {/* ── Category Tabs ───────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: "all", label: "All 8 Visualizations", icon: Layers },
          { id: "flow", label: "Fund Flows & Liquidity (Sankey & Stacked Area)", icon: ArrowRightLeft },
          { id: "performance", label: "Conversion & Latency (Bar & Lines)", icon: Activity },
          { id: "distribution", label: "Market Share & Risk (Pie, Area & Radar)", icon: PieIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as ChartTab)}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === id
                ? "bg-surface font-semibold text-foreground border border-border shadow-sm"
                : "text-muted-foreground hover:bg-surface/50 hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {/* ── 1. Sankey Diagram: Fund Flow Topology ──────────────────── */}
        {showSankey && (
          <section className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                    <ArrowRightLeft className="h-4 w-4" />
                  </span>
                  <h2 className="text-base font-semibold">1. End-to-End Money Flow (Sankey Diagram)</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Full capital tracing from gross customer payment intent through gateway clearing, reserve allocation, fees, and merchant payouts.
                </p>
              </div>
              <StatusPill tone="info">Topological Flow</StatusPill>
            </div>
            <div className="mt-6">
              <MoneyFlowSankeyChart height={340} />
            </div>
          </section>
        )}

        {/* ── 2 & 3. Stacked Bar Chart & Pie Chart ───────────────────── */}
        {(showStackedBar || showPie) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showStackedBar && (
              <section className="panel p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-success/10 p-1.5 text-success">
                        <BarChart3 className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-semibold">2. Attempt Outcomes (Stacked Bar Chart)</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Daily attempts stacked by outcome: Success, Declines, Timeouts, Gateway Errors, and Webhook Lost.
                    </p>
                  </div>
                  <StatusPill tone="success">Attempt-Weighted</StatusPill>
                </div>
                <div className="mt-6">
                  <PaymentOutcomesStackedBarChart height={300} />
                </div>
              </section>
            )}

            {showPie && (
              <section className="panel p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-info/10 p-1.5 text-info">
                        <PieIcon className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-semibold">3. Method Distribution (Pie / Donut Chart)</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Volume distribution across UPI Intent, Domestic Cards, UPI Collect, Netbanking, and Wallets.
                    </p>
                  </div>
                  <StatusPill tone="info">Market Share</StatusPill>
                </div>
                <div className="mt-6">
                  <PaymentMethodsPieChart height={300} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── 4 & 5. Multiple Line Chart & Single Line Chart ─────────── */}
        {(showMultiLine || showLatency) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showMultiLine && (
              <section className="panel p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                        <TrendingUp className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-semibold">4. Rate Comparison (Multiple Line Chart)</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Multi-series comparison: True Success Rate vs Vanity Filtered Rate vs Acquiring Bank Clearance.
                    </p>
                  </div>
                  <StatusPill tone="warning">Rate Illusion Gap</StatusPill>
                </div>
                <div className="mt-6">
                  <MultipleLineChart height={300} />
                </div>
              </section>
            )}

            {showLatency && (
              <section className="panel p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-destructive/10 p-1.5 text-destructive">
                        <Clock className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-semibold">5. Latency Curve (Single Line Chart)</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Hourly p95 transaction confirmation latency (ms) measured against the 5,000ms SLA ceiling.
                    </p>
                  </div>
                  <StatusPill tone="muted">p95 Milliseconds</StatusPill>
                </div>
                <div className="mt-6">
                  <LatencyLineChart height={300} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── 6 & 7. Cumulative Area Chart & Stacked Area Chart ───────── */}
        {(showArea || showStackedArea) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showArea && (
              <section className="panel p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                        <GitCommit className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-semibold">6. Cumulative Volume (Area Chart)</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cumulative gross processed volume (GPV) in ₹ Lakhs with continuous gradient density.
                    </p>
                  </div>
                  <StatusPill tone="info">₹ Lakhs</StatusPill>
                </div>
                <div className="mt-6">
                  <CumulativeVolumeAreaChart height={300} />
                </div>
              </section>
            )}

            {showStackedArea && (
              <section className="panel p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-success/10 p-1.5 text-success">
                        <Layers className="h-4 w-4" />
                      </span>
                      <h2 className="text-base font-semibold">7. Liquidity Layers (Stacked Area Chart)</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Continuous liquidity composition: Available Settlements, In-Transit, Rolling Reserve, and Holds.
                    </p>
                  </div>
                  <StatusPill tone="success">Multi-Layer</StatusPill>
                </div>
                <div className="mt-6">
                  <StackedAreaChart height={300} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── 8. Radar Chart: Multi-Dimensional Health Radar ─────────── */}
        {showRadar && (
          <section className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <h2 className="text-base font-semibold">8. Risk & Gateway Health Profile (Radar Chart)</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  6-dimensional radar benchmarking merchant posture against industry peers: Velocity, 3DS Auth, Webhook Health, Dispute Defense, Mandates, and Cross-Border.
                </p>
              </div>
              <StatusPill tone="info">6-Axis Benchmark</StatusPill>
            </div>
            <div className="mt-6">
              <RiskRadarChart height={360} />
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
