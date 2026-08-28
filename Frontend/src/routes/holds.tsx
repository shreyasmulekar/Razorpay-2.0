import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, FileUp, Timer, UserRound, ShieldAlert, Cpu } from "lucide-react";
import { AppShell, SlaBar, StatusPill } from "@/components/app-shell";
import { formatDateTime, formatINR } from "@/lib/mock-data";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/holds")({
  component: HoldsPage,
});

function HoldsPage() {
  const [liveHolds, setLiveHolds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolds = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/v1/holds/active");
        if (res.ok) {
          const data = await res.json();
          setLiveHolds(data);
        }
      } catch (error) {
        console.error("FastAPI Backend not running!", error);
      }
      setLoading(false);
    };
    fetchHolds();
  }, []);

  return (
    <AppShell
      title="Live ML Risk Holds"
      subtitle="Transparent anomaly detection. One reason code, one document list, one strict SLA deadline."
    >
      <div className="panel mb-6 border-primary/25 bg-accent/40 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" /> Automated Risk & Release Engine
          </h2>
          <ul className="mt-3 grid gap-2.5 text-sm text-surface-foreground sm:grid-cols-2">
            <li>• AI holds only the flagged delta, never your whole balance.</li>
            <li>• If we miss the SLA timer, funds auto-release instantly.</li>
          </ul>
        </div>
        <StatusPill tone="info">Live Backend Connection</StatusPill>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Querying Python Risk Engine...
        </div>
      ) : (
        liveHolds.map((h) => {
          const remaining = Math.max(0, h.slaHours - h.hoursElapsed);
          return (
            <article key={h.id} className="panel p-6 mb-6 shadow-sm border-l-4 border-l-warning">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <StatusPill tone="warning">{h.reason.code}</StatusPill>
                    <span className="text-xs font-mono font-semibold text-destructive flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Risk Score: {h.risk_score}/100
                    </span>
                  </div>
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
                    <Timer className="h-3.5 w-3.5" /> Resolution SLA timer
                  </p>
                  <p className="num mt-2 text-xl font-semibold">{remaining}h left</p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {h.auto_release_eligible 
                      ? `Eligible for Auto-Release at ${formatDateTime(h.autoReleaseAt)}` 
                      : `Manual review required by ${formatDateTime(h.autoReleaseAt)}`}
                  </p>
                  <SlaBar elapsed={h.hoursElapsed} total={h.slaHours} tone={remaining < 10 ? "danger" : "warning"} />
                  <p className="mt-4 flex items-center gap-1.5 text-sm">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    Routing: <span className="font-medium">{h.reviewer}</span>
                  </p>
                </div>

                <div>
                  <p className="eyebrow">Documents requested (Complete List)</p>
                  <ul className="mt-3 space-y-2">
                    {h.requiredDocs.map((d: any) => (
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
                          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
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
        })
      )}
    </AppShell>
  );
}