import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Lock, Truck } from "lucide-react";
import { AppShell, StatusPill } from "@/components/app-shell";
import {
  formatDateTime,
  formatINR,
  settlements,
  type Settlement,
} from "@/lib/mock-data";

export const Route = createFileRoute("/settlements")({
  head: () => ({
    meta: [
      { title: "Settlements — Clarity Payments" },
      {
        name: "description",
        content:
          "Track every payout end to end: gross, fees, tax, net, UTR and the exact promised arrival time.",
      },
      { property: "og:title", content: "Settlements — Clarity Payments" },
      {
        property: "og:description",
        content:
          "Payout timeline with UTR, fee breakdown and promised arrival for every settlement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettlementsPage,
});

const meta: Record<
  Settlement["status"],
  { label: string; tone: "success" | "info" | "muted" | "warning"; Icon: typeof Clock }
> = {
  settled: { label: "Settled", tone: "success", Icon: CheckCircle2 },
  in_transit: { label: "In transit", tone: "info", Icon: Truck },
  scheduled: { label: "Scheduled", tone: "muted", Icon: Clock },
  held: { label: "Held", tone: "warning", Icon: Lock },
};

function SettlementsPage() {
  return (
    <AppShell
      title="Settlements"
      subtitle="Gross, fees, tax and net on every payout — plus the UTR the moment the bank issues it."
    >
      <div className="space-y-4">
        {settlements.map((s) => {
          const { label, tone, Icon } = meta[s.status];
          const onTime =
            s.completedAt !== null &&
            new Date(s.completedAt) <= new Date(s.expectedAt);

          return (
            <article key={s.id} className="panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <StatusPill tone={tone}>
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </StatusPill>
                    <span className="num text-xs text-muted-foreground">{s.id}</span>
                  </div>
                  <p className="num mt-3 text-2xl font-semibold">{formatINR(s.net)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Net of {formatINR(s.fees)} fee + {formatINR(s.tax)} GST on{" "}
                    {formatINR(s.amount)} across {s.txnCount} transactions
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="eyebrow">UTR</p>
                  <p className="num mt-1 text-sm">{s.utr ?? "Issued at payout time"}</p>
                  <p className="mt-2 text-muted-foreground">{s.bank}</p>
                </div>
              </div>

              <ol className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
                <TimelineStep
                  label="Initiated"
                  value={formatDateTime(s.initiatedAt)}
                  done
                />
                <TimelineStep
                  label="Promised by"
                  value={formatDateTime(s.expectedAt)}
                  done={s.status !== "held"}
                />
                <TimelineStep
                  label={s.completedAt ? "Landed" : "Landing"}
                  value={
                    s.completedAt
                      ? `${formatDateTime(s.completedAt)}${onTime ? " · on time" : " · late"}`
                      : s.status === "held"
                        ? "Blocked by open hold"
                        : "Awaiting bank confirmation"
                  }
                  done={Boolean(s.completedAt)}
                />
              </ol>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}

function TimelineStep({
  label,
  value,
  done,
}: {
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <li className="rounded-lg border border-border bg-surface px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p
        className={`num mt-1 text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}
      >
        {value}
      </p>
    </li>
  );
}
