import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, FileUp, Timer, UserRound } from "lucide-react";
import { AppShell, SlaBar, StatusPill } from "@/components/app-shell";
import { formatDateTime, formatINR, holds } from "@/lib/mock-data";

export const Route = createFileRoute("/holds")({
  head: () => ({
    meta: [
      { title: "Holds — Clarity Payments" },
      {
        name: "description",
        content:
          "Every hold carries a machine-readable reason code, the complete document list up front, a named reviewer and an auto-release deadline.",
      },
      { property: "og:title", content: "Holds — Clarity Payments" },
      {
        property: "og:description",
        content:
          "Reason-coded holds with the full document list up front and a hard auto-release deadline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HoldsPage,
});

function HoldsPage() {
  return (
    <AppShell
      title="Holds"
      subtitle="One reason code, one complete document list, one deadline. We never drip-feed document requests."
    >
      <div className="panel mb-6 border-primary/25 bg-accent/40 p-6">
        <h2 className="text-base font-semibold">How holds work here</h2>
        <ul className="mt-3 grid gap-2.5 text-sm text-surface-foreground sm:grid-cols-2">
          <li>• We hold only the flagged delta, never your whole balance.</li>
          <li>• The full document list is issued at hold creation — all at once.</li>
          <li>• A named reviewer owns the case; no ticket bounces.</li>
          <li>• If we miss the SLA, funds auto-release in your favour.</li>
        </ul>
      </div>

      {holds.map((h) => {
        const remaining = Math.max(0, h.slaHours - h.hoursElapsed);
        return (
          <article key={h.id} className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <StatusPill tone="warning">{h.reason.code}</StatusPill>
                <h2 className="mt-3 text-lg font-semibold">{h.reason.label}</h2>
                <p className="mt-2 text-sm text-surface-foreground">{h.reason.detail}</p>
              </div>
              <div className="text-right">
                <p className="num text-2xl font-semibold">{formatINR(h.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  Opened {formatDateTime(h.openedAt)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
              <div>
                <p className="eyebrow flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" /> Resolution SLA
                </p>
                <p className="num mt-2 text-xl font-semibold">{remaining}h left</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Auto-release {formatDateTime(h.autoReleaseAt)} if we don't decide.
                </p>
                <SlaBar elapsed={h.hoursElapsed} total={h.slaHours} tone="warning" />
                <p className="mt-4 flex items-center gap-1.5 text-sm">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  Reviewer: <span className="font-medium">{h.reviewer}</span>
                </p>
              </div>

              <div>
                <p className="eyebrow">Documents requested (complete list)</p>
                <ul className="mt-3 space-y-2">
                  {h.requiredDocs.map((d) => (
                    <li
                      key={d.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        {d.status === "pending" ? (
                          <CircleDashed className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                        {d.name}
                      </span>
                      {d.status === "pending" ? (
                        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                          <FileUp className="h-3.5 w-3.5" /> Upload
                        </button>
                      ) : (
                        <StatusPill tone="success">Received</StatusPill>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}
    </AppShell>
  );
}
