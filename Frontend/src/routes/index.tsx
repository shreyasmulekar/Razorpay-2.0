import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Lock, TrendingUp, Wallet } from "lucide-react";
import { AppShell, SlaBar, StatusPill } from "@/components/app-shell";
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
});

const cards = [
  {
    label: "Available now",
    value: balances.available,
    icon: Wallet,
    note: "Withdrawable instantly",
    tone: "text-success",
  },
  {
    label: "In transit",
    value: balances.inTransit,
    icon: TrendingUp,
    note: "At bank, UTR issued",
    tone: "text-primary",
  },
  {
    label: "Scheduled today",
    value: balances.scheduledToday,
    icon: Clock,
    note: "Leaves at 11:00 IST",
    tone: "text-info",
  },
  {
    label: "On hold",
    value: balances.onHold,
    icon: Lock,
    note: "1 reason-coded hold",
    tone: "text-warning-foreground",
  },
];

function MoneyFlow() {
  const hold = holds[0];

  return (
    <AppShell
      title="Money flow"
      subtitle="Every rupee has a state, a reason and a deadline. Nothing sits in an unexplained bucket."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, note, tone }) => (
          <div key={label} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{label}</p>
              <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <p className="num mt-3 text-2xl font-semibold">{formatINR(value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Settled vs held, last 7 days</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Held volume is charted alongside settled volume — never hidden in a
                separate report.
              </p>
            </div>
            <StatusPill tone="success">Healthy</StatusPill>
          </div>
          <div className="mt-8">
            <div className="flex items-end gap-3">
              {settlementTrend.map((d) => {
                const max = 550;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-48 w-full items-end justify-center gap-1">
                      <div
                        className="w-1/2 rounded-t-md bg-primary/85"
                        style={{ height: `${Math.round((d.settled / max) * 192)}px` }}
                        title={`Settled ₹${d.settled},000`}
                      />
                      <div
                        className="w-1/2 rounded-t-md bg-warning/85"
                        style={{ height: `${Math.max(Math.round((d.held / max) * 192), 3)}px` }}
                        title={`Held ₹${d.held},000`}
                      />
                    </div>

                    <span className="num text-[11px] text-muted-foreground">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Settled
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Held
              </span>
              <span className="num ml-auto text-muted-foreground">₹ thousands</span>
            </div>
          </div>

        </section>

        <section className="panel p-6">
          <h2 className="text-base font-semibold">Our promises, measured</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The same numbers our risk team is graded on.
          </p>
          <ul className="mt-5 space-y-4">
            {promises.map((p) => (
              <li key={p.label} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="num text-xl font-semibold">{p.value}</p>
                <p className="mt-0.5 text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.sub}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {hold ? (
        <section className="mt-6 rounded-xl border border-warning/40 bg-warning/8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <StatusPill tone="warning">Hold open · {hold.reason.code}</StatusPill>
              <h2 className="mt-3 text-base font-semibold">{hold.reason.label}</h2>
              <p className="mt-1.5 text-sm text-surface-foreground">{hold.reason.detail}</p>
            </div>
            <div className="text-right">
              <p className="num text-2xl font-semibold">{formatINR(hold.amount)}</p>
              <p className="text-xs text-muted-foreground">
                Auto-releases {formatDateTime(hold.autoReleaseAt)}
              </p>
            </div>
          </div>
          <div className="mt-5 max-w-md">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>{hold.hoursElapsed}h elapsed</span>
              <span>{hold.slaHours}h SLA cap</span>
            </div>
            <SlaBar elapsed={hold.hoursElapsed} total={hold.slaHours} tone="warning" />
          </div>
          <Link
            to="/holds"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Resolve this hold <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : null}

      <section className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-base font-semibold">Ledger</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Fees, holds and payouts posted as line items — no lump-sum deductions.
            </p>
          </div>
          <Link to="/settlements" className="text-sm font-semibold text-primary hover:underline">
            All settlements
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="eyebrow px-6 py-3 font-semibold">When</th>
                <th className="eyebrow px-6 py-3 font-semibold">Description</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">Amount</th>
                <th className="eyebrow px-6 py-3 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="num px-6 py-3.5 text-xs text-muted-foreground">
                    {formatDateTime(e.date)}
                  </td>
                  <td className="px-6 py-3.5">{e.description}</td>
                  <td
                    className={`num px-6 py-3.5 text-right font-medium ${
                      e.amount > 0 ? "text-success" : "text-foreground"
                    }`}
                  >
                    {formatINR(e.amount)}
                  </td>
                  <td className="num px-6 py-3.5 text-right text-muted-foreground">
                    {formatINR(e.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Next payout: {settlements.find((s) => s.status === "scheduled")?.expectedAt
          ? formatDateTime(settlements.find((s) => s.status === "scheduled")!.expectedAt)
          : "—"}
      </p>
    </AppShell>
  );
}
