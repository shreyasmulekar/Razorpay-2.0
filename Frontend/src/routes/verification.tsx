import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { AppShell, SlaBar, StatusPill } from "@/components/app-shell";
import { kycItems, type KycItem } from "@/lib/mock-data";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Verification — Clarity Payments" },
      {
        name: "description",
        content:
          "The entire KYC checklist up front with a per-item SLA timer, so onboarding never becomes a 72-hour drip of one-document-at-a-time requests.",
      },
      { property: "og:title", content: "Verification — Clarity Payments" },
      {
        property: "og:description",
        content:
          "The full KYC checklist up front, each item with its own review SLA timer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerificationPage,
});

const statusMeta: Record<
  KycItem["status"],
  { label: string; tone: "success" | "info" | "warning" | "muted"; Icon: typeof Circle }
> = {
  approved: { label: "Approved", tone: "success", Icon: CheckCircle2 },
  in_review: { label: "In review", tone: "info", Icon: Loader2 },
  action_needed: { label: "Action needed", tone: "warning", Icon: AlertTriangle },
  not_started: { label: "Optional", tone: "muted", Icon: Circle },
};

function VerificationPage() {
  const required = kycItems.filter((k) => k.required);
  const approved = required.filter((k) => k.status === "approved").length;
  const pct = Math.round((approved / required.length) * 100);

  return (
    <AppShell
      title="Verification"
      subtitle="Everything we will ever ask for is listed below from day one — with the review clock visible on each item."
    >
      <div className="panel mb-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Activation progress</p>
            <p className="num mt-2 text-3xl font-semibold">{pct}%</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {approved} of {required.length} required items approved · account stays
              Live throughout review
            </p>
          </div>
          <StatusPill tone="success">No sandbox rollback, ever</StatusPill>
        </div>
        <div className="mt-5">
          <SlaBar elapsed={approved} total={required.length} tone="success" />
        </div>
      </div>

      <div className="space-y-3">
        {kycItems.map((k) => {
          const { label, tone, Icon } = statusMeta[k.status];
          const overdue = k.hoursElapsed > k.slaHours;
          return (
            <article key={k.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-5 w-5 ${
                      k.status === "approved"
                        ? "text-success"
                        : k.status === "action_needed"
                          ? "text-warning"
                          : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {k.name}{" "}
                      {!k.required && (
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{k.category}</p>
                    <p className="mt-2 max-w-xl text-sm text-surface-foreground">
                      {k.note}
                    </p>
                  </div>
                </div>
                <div className="w-44 text-right">
                  <StatusPill tone={tone}>{label}</StatusPill>
                  {k.status !== "approved" && k.status !== "not_started" && (
                    <>
                      <p className="num mt-3 text-xs text-muted-foreground">
                        {k.hoursElapsed}h / {k.slaHours}h SLA
                      </p>
                      <div className="mt-1.5">
                        <SlaBar
                          elapsed={k.hoursElapsed}
                          total={k.slaHours}
                          tone={overdue ? "warning" : "info"}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
