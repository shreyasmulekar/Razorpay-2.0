import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Lock, TrendingUp, Wallet } from "lucide-react";
import { AppShell, SlaBar, StatusPill } from "@/components/app-shell";
import { DashboardError, DashboardNotFound, DashboardSkeleton } from "@/components/dashboard-states";
import { DrilldownButton } from "@/components/drilldown";
import { ExportMenu } from "@/components/export-menu";
import type { Dataset } from "@/lib/report";
import { BarRow, ColumnChart, Donut, Sparkline, StackedBar } from "@/components/charts";
import { MoneyFlowSankeyChart, StackedAreaChart } from "@/components/advanced-charts";
import { ExpandCard, ExpandPanel } from "@/components/expandable";
import {
  balances,
  formatDateTime,
  formatINR,
  holds,
  ledger,
  promises,
  settlementTrend,
  settlements,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Money Flow — Clarity Payments Merchant Console" },
      {
        name: "description",
        content:
          "Every rupee accounted for: live balances, payout timelines, reason-coded holds and SLA timers for Indian merchants.",
      },
      { property: "og:title", content: "Money Flow — Clarity Payments" },
      {
        property: "og:description",
        content:
          "Live balances, payout timelines and reason-coded holds with hard SLA commitments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MoneyFlow,
  pendingComponent: () => <DashboardSkeleton tiles={4} panels={3} />,
  errorComponent: ({ error }) => <DashboardError error={error} view="money flow" />,
  notFoundComponent: () => <DashboardNotFound view="money flow" />,
});

const settledSeries = settlementTrend.map((d) => d.settled);
const heldSeries = settlementTrend.map((d) => d.held);

function MoneyFlow() {
  const hold = holds[0];
  const total =
    balances.available + balances.inTransit + balances.scheduledToday + balances.onHold;
  const lastSettlements = settlements.slice(0, 4);
  const rupees = (paise: number) => +(paise / 100).toFixed(2);

  const balanceDataset: Dataset = {
    title: "Balance composition",
    note: "Amounts in INR. Total = available + in transit + scheduled + on hold.",
    columns: ["Bucket", "Amount (INR)", "Share %"],
    rows: (
      [
        ["Available", balances.available],
        ["In transit", balances.inTransit],
        ["Scheduled today", balances.scheduledToday],
        ["On hold", balances.onHold],
      ] as [string, number][]
    ).map(([l, v]) => [l, rupees(v), +((v / total) * 100).toFixed(2)]),
  };
  const settlementDataset: Dataset = {
    title: "Settlements",
    columns: ["Reference", "UTR", "Status", "Gross (INR)", "Fees (INR)", "Net (INR)", "Expected at"],
    rows: settlements.map((x) => [
      x.id,
      x.utr ?? "—",
      x.status,
      rupees(x.amount),
      rupees(x.amount - x.net),
      rupees(x.net),
      formatDateTime(x.expectedAt),
    ]),
  };
  const trendDataset: Dataset = {
    title: "Settled vs held, last 7 days",
    note: "Values in ₹ thousands.",
    columns: ["Day", "Settled (₹k)", "Held (₹k)"],
    rows: settlementTrend.map((d) => [d.day, d.settled, d.held]),
  };
  const ledgerDataset: Dataset = {
    title: "Ledger",
    columns: ["When", "Description", "Amount (INR)", "Balance (INR)"],
    rows: ledger.map((e) => [
      formatDateTime(e.date),
      e.description,
      rupees(e.amount),
      rupees(e.balance),
    ]),
  };
  const promisesDataset: Dataset = {
    title: "Promises, measured",
    columns: ["Commitment", "Value", "Detail"],
    rows: promises.map((p) => [p.label, p.value, p.sub]),
  };
  const holdsDataset: Dataset = {
    title: "Open holds",
    columns: ["Reason code", "Reason", "Amount (INR)", "Hours elapsed", "SLA hours"],
    rows: holds.map((h) => [
      h.reason.code,
      h.reason.label,
      rupees(h.amount),
      h.hoursElapsed,
      h.slaHours,
    ]),
  };
  const allDatasets = [
    balanceDataset,
    trendDataset,
    settlementDataset,
    holdsDataset,
    promisesDataset,
    ledgerDataset,
  ];

  return (
    <AppShell
      title="Money flow"
      subtitle="Start with the headline number. Click any tile to unfold the data behind it — nothing is buried in a separate report."
      actions={
        <ExportMenu
          title="Money flow"
          subtitle="Balances, settlements, holds and ledger for the current cycle."
          filename="clarity-money-flow"
          datasets={allDatasets}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExpandCard
          label="Available now"
          value={formatINR(balances.available)}
          note="Withdrawable instantly"
          icon={Wallet}
          tone="text-success"
          preview={<Sparkline values={settledSeries} className="text-success" />}
        >
          <p className="eyebrow">Where it came from</p>
          <div className="mt-3 space-y-2.5">
            {lastSettlements.map((s) => (
              <BarRow
                key={s.id}
                label={s.utr ?? s.id}
                value={s.net}
                max={Math.max(...lastSettlements.map((x) => x.net))}
                display={formatINR(s.net)}
                className="bg-success"
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Net of fees and tax, already posted to your ledger line by line.
          </p>
          <DrilldownButton
            title="Available balance — the exact payouts behind it"
            description="Every settlement with gross, fees and net, plus the ledger lines they posted."
            datasets={[settlementDataset, ledgerDataset]}
          />
        </ExpandCard>

        <ExpandCard
          label="In transit"
          value={formatINR(balances.inTransit)}
          note="At bank, UTR issued"
          icon={TrendingUp}
          tone="text-primary"
          preview={<Sparkline values={heldSeries.map((h, i) => settledSeries[i]! - h)} />}
        >
          <p className="eyebrow">Journey of this payout</p>
          <ol className="mt-3 space-y-3 text-xs">
            {[
              ["Captured & reconciled", "Done"],
              ["Fees and tax deducted", "Done"],
              ["Handed to bank with UTR", "Done"],
              ["Credited to HDFC ••4471", "Pending"],
            ].map(([step, state]) => (
              <li key={step} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      state === "Done" ? "bg-success" : "bg-warning"
                    }`}
                  />
                  {step}
                </span>
                <span className="num text-muted-foreground">{state}</span>
              </li>
            ))}
          </ol>
          <DrilldownButton
            title="In-transit payouts"
            description="Payouts handed to the bank, with UTR and promised credit time."
            datasets={[settlementDataset]}
          />
        </ExpandCard>

        <ExpandCard
          label="Scheduled today"
          value={formatINR(balances.scheduledToday)}
          note="Leaves at 11:00 IST"
          icon={Clock}
          tone="text-info"
          preview={<Sparkline values={settledSeries.slice().reverse()} className="text-info" />}
        >
          <p className="eyebrow">Composition of the balance</p>
          <div className="mt-4 flex items-center gap-5">
            <Donut
              size={116}
              centerLabel={formatINR(total)}
              centerSub="total"
              segments={[
                { label: "Available", value: balances.available, className: "text-success" },
                { label: "In transit", value: balances.inTransit, className: "text-primary" },
                { label: "Scheduled", value: balances.scheduledToday, className: "text-info" },
                { label: "On hold", value: balances.onHold, className: "text-warning" },
              ]}
            />
            <ul className="space-y-1.5 text-[11px]">
              {[
                ["Available", balances.available, "bg-success"],
                ["In transit", balances.inTransit, "bg-primary"],
                ["Scheduled", balances.scheduledToday, "bg-info"],
                ["On hold", balances.onHold, "bg-warning"],
              ].map(([l, v, c]) => (
                <li key={l as string} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-sm ${c as string}`} />
                  <span className="text-muted-foreground">{l as string}</span>
                  <span className="num ml-auto">{formatINR(v as number)}</span>
                </li>
              ))}
            </ul>
          </div>
          <DrilldownButton
            title="Balance composition"
            description="Exact rupee amounts and shares behind the donut."
            datasets={[balanceDataset, settlementDataset]}
          />
        </ExpandCard>

        <ExpandCard
          label="On hold"
          value={formatINR(balances.onHold)}
          note="1 reason-coded hold"
          icon={Lock}
          tone="text-warning-foreground"
          preview={<Sparkline values={heldSeries} className="text-warning" />}
        >
          {hold ? (
            <>
              <StatusPill tone="warning">{hold.reason.code}</StatusPill>
              <p className="mt-2.5 text-sm font-medium">{hold.reason.label}</p>
              <p className="mt-1 text-xs text-surface-foreground">{hold.reason.detail}</p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
                  <span>{hold.hoursElapsed}h elapsed</span>
                  <span>{hold.slaHours}h cap</span>
                </div>
                <SlaBar elapsed={hold.hoursElapsed} total={hold.slaHours} tone="warning" />
              </div>
              <Link
                to="/holds"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Resolve this hold <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No open holds.</p>
          )}
          <DrilldownButton
            title="Holds — reason codes and SLA clocks"
            description="Every held rupee with its reason code and elapsed review time."
            datasets={[holdsDataset]}
          />
        </ExpandCard>
      </div>

      <div className="mt-6 grid gap-6">
        <ExpandPanel
          title="Settled vs held, last 7 days"
          summary={
            <span>
              Settled{" "}
              <span className="num text-foreground">
                ₹{settledSeries.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}k
              </span>{" "}
              · Held{" "}
              <span className="num text-foreground">
                ₹{heldSeries.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}k
              </span>{" "}
              — open for the daily chart
            </span>
          }
          badge={<StatusPill tone="success">Healthy</StatusPill>}
        >
          <ColumnChart
            data={settlementTrend.map((d) => ({ label: d.day, a: d.settled, b: d.held }))}
            format={(v) => `₹${v}k`}
          />
          <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Settled
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Held
            </span>
            <span className="num ml-auto text-muted-foreground">₹ thousands</span>
          </div>
          <div className="mt-6">
            <p className="eyebrow">Where the week's money sits</p>
            <div className="mt-3">
              <StackedBar
                parts={[
                  { label: "Settled", value: settledSeries.reduce((a, b) => a + b, 0), className: "bg-primary" },
                  { label: "Held", value: heldSeries.reduce((a, b) => a + b, 0), className: "bg-warning" },
                ]}
              />
            </div>
          </div>
          <DrilldownButton
            title="Settled vs held daily series"
            description="Hover for each day's settled and held totals."
            datasets={[trendDataset]}
          />
        </ExpandPanel>

        {/* ── End-to-End Money Flow Sankey & Liquidity Stacked Area ── */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold">End-to-End Fund Flow Diagram</h2>
                <p className="text-xs text-muted-foreground">Sankey diagram tracing capital from intent to settlement</p>
              </div>
              <StatusPill tone="info">Sankey</StatusPill>
            </div>
            <div className="mt-4">
              <MoneyFlowSankeyChart height={280} />
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold">Liquidity Dynamics & Reserve Growth</h2>
                <p className="text-xs text-muted-foreground">Stacked area chart of available, in-transit, and reserve buffers</p>
              </div>
              <StatusPill tone="success">Stacked Area</StatusPill>
            </div>
            <div className="mt-4">
              <StackedAreaChart height={280} />
            </div>
          </div>
        </section>

        <ExpandPanel

          title="Our promises, measured"
          summary={`${promises.length} commitments our risk team is graded on`}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {promises.map((p) => (
              <div key={p.label} className="rounded-lg border border-border bg-surface p-4">
                <p className="num text-xl font-semibold">{p.value}</p>
                <p className="mt-0.5 text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.sub}</p>
              </div>
            ))}
          </div>
          <DrilldownButton
            title="Promises, measured"
            description="The commitments and their current measured values."
            datasets={[promisesDataset]}
          />
        </ExpandPanel>

        <ExpandPanel
          title="Ledger"
          summary={`${ledger.length} line items — fees, holds and payouts posted individually`}
          badge={
            <Link
              to="/settlements"
              className="text-xs font-semibold text-primary hover:underline"
            >
              All settlements
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="eyebrow py-3 font-semibold">When</th>
                  <th className="eyebrow py-3 font-semibold">Description</th>
                  <th className="eyebrow py-3 text-right font-semibold">Amount</th>
                  <th className="eyebrow py-3 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface"
                  >
                    <td className="num py-3.5 pr-4 text-xs text-muted-foreground">
                      {formatDateTime(e.date)}
                    </td>
                    <td className="py-3.5 pr-4">{e.description}</td>
                    <td
                      className={`num py-3.5 pr-4 text-right font-medium ${
                        e.amount > 0 ? "text-success" : "text-foreground"
                      }`}
                    >
                      {formatINR(e.amount)}
                    </td>
                    <td className="num py-3.5 text-right text-muted-foreground">
                      {formatINR(e.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DrilldownButton
            title="Ledger lines"
            description="Every fee, hold and payout posted individually, with running balance."
            datasets={[ledgerDataset, settlementDataset]}
          />
        </ExpandPanel>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Next payout:{" "}
        {settlements.find((s) => s.status === "scheduled")?.expectedAt
          ? formatDateTime(settlements.find((s) => s.status === "scheduled")!.expectedAt)
          : "—"}
      </p>
    </AppShell>
  );
}
