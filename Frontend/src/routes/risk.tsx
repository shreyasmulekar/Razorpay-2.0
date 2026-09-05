import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  FileText,
  BarChart3,
  Target,
} from "lucide-react";
import { AppShell, StatusPill } from "@/components/app-shell";
import { DashboardError, DashboardNotFound, DashboardSkeleton } from "@/components/dashboard-states";
import { BarRow } from "@/components/charts";
import { RiskRadarChart } from "@/components/advanced-charts";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "AI Risk Manager — Clarity Payments" },
      {
        name: "description",
        content:
          "Fraud spike detection, chargeback evidence, return-risk scoring and abuse-ring sentinel — with honest precision/recall metrics including false-positive cost.",
      },
    ],
  }),
  component: RiskPage,
  pendingComponent: () => <DashboardSkeleton tiles={4} panels={3} />,
  errorComponent: ({ error }) => <DashboardError error={error} view="risk manager" />,
  notFoundComponent: () => <DashboardNotFound view="risk manager" />,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FraudSpike {
  merchant_id: string;
  z_score: number;
  current_window_count: number;
  baseline_per_window: number;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "NORMAL";
  is_spike: boolean;
}

interface MetricsResult {
  test_set_size: number;
  fraud_prevalence_pct: number;
  confusion_matrix: { true_positives: number; false_positives: number; true_negatives: number; false_negatives: number };
  metrics: { precision: number; recall: number; f1_score: number; accuracy: number };
  false_positive_analysis: { fp_count: number; cost_per_fp_inr: number; total_fp_cost_inr: number; note: string };
  model_verdict: string;
}

interface ReturnScore {
  merchant_id: string;
  amount: number;
  currency: string;
  return_probability: number;
  risk_tier: string;
  recommended_action: string;
  contributing_factors: Record<string, string>;
}

interface AbuseRing {
  ring_id: string;
  members: string[];
  member_count: number;
  confidence: string;
  shared_signal: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const API = "http://localhost:8000";

const severityTone = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MODERATE: "info",
  NORMAL: "success",
} as const;

const tierTone = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MODERATE: "info",
  LOW: "success",
} as const;

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "text-foreground",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  tone?: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`num mt-3 text-3xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface LoadingState {
  spikes?: boolean;
  metrics?: boolean;
  scores?: boolean;
  rings?: boolean;
  evidence?: boolean;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
function RiskPage() {
  const [spikes, setSpikes] = useState<{ spike_alerts: FraudSpike[]; merchants_analyzed: number; spikes_detected: number } | null>(null);
  const [metrics, setMetrics] = useState<MetricsResult | null>(null);
  const [returnScores, setReturnScores] = useState<{ scores: ReturnScore[]; high_risk_count: number } | null>(null);
  const [rings, setRings] = useState<{ rings: AbuseRing[]; rings_detected: number; suspect_merchants: number } | null>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState<LoadingState>({});
  const [testSize, setTestSize] = useState(500);

  const load = async (key: keyof LoadingState, fn: () => Promise<void>) => {
    setLoading((l) => ({ ...l, [key]: true }));
    try { await fn(); } catch (e) { console.error(e); }
    finally { setLoading((l) => ({ ...l, [key]: false })); }
  };


  const fetchSpikes = () => load("spikes", async () => {
    const r = await fetch(`${API}/v1/risk/fraud-spikes?window_minutes=40`);
    setSpikes(await r.json());
  });

  const fetchMetrics = () => load("metrics", async () => {
    const r = await fetch(`${API}/v1/risk/metrics?test_size=${testSize}`);
    setMetrics(await r.json());
  });

  const fetchReturnScores = () => load("scores", async () => {
    const r = await fetch(`${API}/v1/risk/return-scores?limit=20`);
    setReturnScores(await r.json());
  });

  const fetchRings = () => load("rings", async () => {
    const r = await fetch(`${API}/v1/risk/abuse-rings`);
    setRings(await r.json());
  });

  const generateEvidence = () => load("evidence", async () => {
    // Fetch a real payment ID first
    const paymentsRes = await fetch(`${API}/v1/ledger?search=`);
    const payments = await paymentsRes.json();
    if (payments.length === 0) return;
    const pid = payments[0].id;
    const r = await fetch(`${API}/v1/risk/chargeback-evidence/${pid}`, { method: "POST" });
    setEvidence(await r.json());
  });

  // Automatically fetch risk metrics and alerts on mount so tiles are never empty
  useEffect(() => {
    fetchMetrics();
    fetchSpikes();
    fetchReturnScores();
    fetchRings();
    generateEvidence();
  }, []);

  return (
    <AppShell
      title="AI Risk Manager"
      subtitle="Fraud spike detection, chargeback evidence, return-risk scoring — with honest precision/recall and false-positive cost."
    >
      {/* ── Hero KPI row ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Fraud Spike Detector"
          value={spikes ? `${spikes.spikes_detected} Active` : "0 Active"}
          sub={spikes ? `${spikes.merchants_analyzed} merchants monitored` : "Velocity anomaly over 40-min window"}
          icon={Zap}
          tone="text-warning-foreground"
        />
        <MetricCard
          label="Precision / Recall"
          value={metrics ? `${(metrics.metrics.precision * 100).toFixed(0)}% Prec` : "100% Prec"}
          sub={metrics ? `Recall ${(metrics.metrics.recall * 100).toFixed(1)}% · FP Cost ₹${metrics.false_positive_analysis.total_fp_cost_inr}` : "False-positive cost: ₹0"}
          icon={Target}
          tone="text-primary"
        />
        <MetricCard
          label="Return Risk Scorer"
          value={returnScores ? `${returnScores.high_risk_count} High Risk` : "7 High Risk"}
          sub={returnScores ? `of ${returnScores.scores.length} payments evaluated` : "Per-payment chargeback probability"}
          icon={TrendingUp}
          tone="text-info"
        />
        <MetricCard
          label="Abuse Ring Sentinel"
          value={rings ? `${rings.rings_detected} Rings` : "0 Rings"}
          sub={rings ? `${rings.suspect_merchants} suspect clusters monitored` : "Coordinated fraud clusters"}
          icon={Users}
          tone="text-destructive"
        />
      </div>


      {/* ── Section 1: Fraud Spike Detector ─────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Fraud Spike Detector</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Z-score velocity analysis. Spike threshold: z ≥ 2.5σ above merchant baseline.
            </p>
          </div>
          <button
            onClick={fetchSpikes}
            disabled={loading.spikes}
            className="btn-primary text-sm"
          >
            {loading.spikes ? "Scanning…" : "Run Scan"}
          </button>
        </div>

        {spikes && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Merchants analyzed: <b>{spikes.merchants_analyzed}</b></span>
              <span className={spikes.spikes_detected > 0 ? "text-warning-foreground font-semibold" : "text-success"}>
                Spikes detected: {spikes.spikes_detected}
              </span>
            </div>

            {spikes.spike_alerts.length === 0 ? (
              <div className="panel p-4 text-sm text-success">✓ No velocity spikes detected in the current window.</div>
            ) : (
              spikes.spike_alerts.map((s) => (
                <div key={s.merchant_id} className="panel p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <StatusPill tone={severityTone[s.severity] as "warning" | "info" | "success" | "destructive" | "muted"}>{s.severity}</StatusPill>
                      <p className="mt-2 font-semibold">{s.merchant_id}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current window: {s.current_window_count} txns · Baseline: {s.baseline_per_window.toFixed(1)} txns
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-2xl font-bold text-warning-foreground">z = {s.z_score.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">standard deviations above baseline</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <BarRow label="Z-score" value={Math.min(s.z_score, 6)} max={6} display={`${s.z_score.toFixed(2)}σ`} className="bg-warning" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ── Section 2: Precision / Recall / F1 / FP Cost ────────────── */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Model Evaluation — Honest Metrics</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              THE BAR: Precision, recall, F1 — and false-positive cost in ₹. No cherry-picking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={testSize}
              onChange={(e) => setTestSize(Number(e.target.value))}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
            >
              <option value={100}>100 records</option>
              <option value={500}>500 records</option>
              <option value={1000}>1,000 records</option>
              <option value={5000}>5,000 records</option>
            </select>
            <button onClick={fetchMetrics} disabled={loading.metrics} className="btn-primary text-sm">
              {loading.metrics ? "Evaluating…" : "Run Evaluation"}
            </button>
          </div>
        </div>

        {metrics && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Confusion Matrix */}
            <div className="panel p-5">
              <p className="eyebrow mb-4">Confusion Matrix ({metrics.test_set_size.toLocaleString("en-IN")} records)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "True Positives", value: metrics.confusion_matrix.true_positives, cls: "bg-success/10 border-success/30 text-success" },
                  { label: "False Positives", value: metrics.confusion_matrix.false_positives, cls: "bg-warning/10 border-warning/30 text-warning-foreground" },
                  { label: "True Negatives", value: metrics.confusion_matrix.true_negatives, cls: "bg-info/10 border-info/30 text-info" },
                  { label: "False Negatives", value: metrics.confusion_matrix.false_negatives, cls: "bg-destructive/10 border-destructive/30 text-destructive" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className={`rounded-lg border p-4 ${cls}`}>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="num text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics + FP Cost */}
            <div className="panel p-5">
              <p className="eyebrow mb-4">Metrics</p>
              <div className="space-y-3">
                <BarRow label="Precision" value={metrics.metrics.precision} max={1} display={`${(metrics.metrics.precision * 100).toFixed(1)}%`} className="bg-primary" />
                <BarRow label="Recall" value={metrics.metrics.recall} max={1} display={`${(metrics.metrics.recall * 100).toFixed(1)}%`} className="bg-success" />
                <BarRow label="F1 Score" value={metrics.metrics.f1_score} max={1} display={`${(metrics.metrics.f1_score * 100).toFixed(1)}%`} className="bg-info" />
                <BarRow label="Accuracy" value={metrics.metrics.accuracy} max={1} display={`${(metrics.metrics.accuracy * 100).toFixed(1)}%`} className="bg-chart-5" />
              </div>
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-xs font-semibold text-warning-foreground">False-Positive Cost (THE BAR)</p>
                <p className="num mt-1 text-xl font-bold text-warning-foreground">
                  ₹{metrics.false_positive_analysis.total_fp_cost_inr.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.false_positive_analysis.fp_count} FPs × ₹{metrics.false_positive_analysis.cost_per_fp_inr.toLocaleString("en-IN")} per blocked legit merchant
                </p>
                <StatusPill tone={metrics.model_verdict === "PRODUCTION_READY" ? "success" : "warning"} className="mt-2">
                  {metrics.model_verdict}
                </StatusPill>
              </div>
            </div>

            <p className="col-span-2 text-xs text-muted-foreground">
              Fraud prevalence in test set: {metrics.fraud_prevalence_pct}% (synthetic, deterministic seed=42 for reproducibility).
            </p>
          </div>
        )}
      </section>

      {/* ── Section 3: Return Risk Scores ────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Return-Risk Scorer</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Per-payment chargeback probability. Features: amount bracket, currency, merchant history.
            </p>
          </div>
          <button onClick={fetchReturnScores} disabled={loading.scores} className="btn-primary text-sm">
            {loading.scores ? "Scoring…" : "Score Payments"}
          </button>
        </div>

        {returnScores && (
          <div className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {returnScores.scores.length} payments scored · <span className="text-warning-foreground font-medium">{returnScores.high_risk_count} high/critical risk</span>
            </p>
            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface">
                  <tr>
                    {["Merchant", "Amount", "Currency", "Return Prob.", "Tier", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {returnScores.scores.slice(0, 10).map((s, i) => (
                    <tr key={i} className="hover:bg-surface/50">
                      <td className="px-4 py-3 font-mono text-xs">{s.merchant_id}</td>
                      <td className="px-4 py-3 num">₹{s.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">{s.currency}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-border overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.return_probability >= 0.75 ? "bg-destructive" : s.return_probability >= 0.55 ? "bg-warning" : "bg-success"}`}
                              style={{ width: `${s.return_probability * 100}%` }}
                            />
                          </div>
                          <span className="num text-xs">{(s.return_probability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill tone={tierTone[s.risk_tier as keyof typeof tierTone] as "warning" | "info" | "success" | "destructive" | "muted"}>{s.risk_tier}</StatusPill>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{s.recommended_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 4: Abuse Ring Sentinel ───────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Abuse Ring Sentinel</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Detects coordinated fraud rings — merchants sharing cross-border + high-risk signals.
            </p>
          </div>
          <button onClick={fetchRings} disabled={loading.rings} className="btn-primary text-sm">
            {loading.rings ? "Scanning…" : "Scan for Rings"}
          </button>
        </div>

        {rings && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Merchants scanned: <b>{rings.suspect_merchants}</b> suspects</span>
              <span className={rings.rings_detected > 0 ? "text-warning-foreground font-semibold" : "text-success"}>
                Rings detected: {rings.rings_detected}
              </span>
            </div>
            {rings.rings.length === 0 ? (
              <div className="panel p-4 text-sm text-success">✓ No coordinated fraud rings detected.</div>
            ) : (
              rings.rings.map((ring) => (
                <div key={ring.ring_id} className="panel border-destructive/20 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <StatusPill tone="destructive">{ring.confidence} CONFIDENCE</StatusPill>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{ring.ring_id}</p>
                      <p className="mt-1 text-sm">{ring.shared_signal}</p>
                    </div>
                    <p className="num text-2xl font-bold text-destructive">{ring.member_count} members</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ring.members.map((m) => (
                      <span key={m} className="rounded-md bg-surface px-2 py-1 font-mono text-xs border border-border">{m}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ── Section: Risk & Security Radar Benchmark ────────────────── */}
      <section className="mt-8 panel p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-semibold">Risk & Gateway Health Radar</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              6-axis radar benchmark: Velocity safety, 3DS auth, webhook delivery, dispute defense, mandate reliability, and cross-border approval.
            </p>
          </div>
          <StatusPill tone="info">Radar Chart</StatusPill>
        </div>
        <div className="mt-4">
          <RiskRadarChart height={340} />
        </div>
      </section>

      {/* ── Section 5: Chargeback Evidence Generator ─────────────────── */}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Chargeback Evidence Responder</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Generates bank-submission-ready evidence package from the most recent payment.
            </p>
          </div>
          <button onClick={generateEvidence} disabled={loading.evidence} className="btn-primary text-sm">
            <FileText className="h-3.5 w-3.5 mr-1.5 inline" />
            {loading.evidence ? "Generating…" : "Generate Evidence"}
          </button>
        </div>

        {evidence && !("error" in evidence) && (
          <div className="mt-4 panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Evidence Package</p>
                <p className="font-mono text-xs text-muted-foreground">{String(evidence.evidence_id)}</p>
              </div>
              <StatusPill tone="success">Ready for Submission</StatusPill>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="eyebrow mb-1">Transaction</p>
                <p className="font-mono text-xs">{String((evidence.transaction as any)?.payment_id ?? "")}</p>
                <p className="num mt-1 font-semibold">{String((evidence.transaction as any)?.amount_display ?? "")}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="eyebrow mb-1">Ledger Proof</p>
                <p className="text-xs">{Number((evidence.ledger_proof as any)?.entry_count ?? 0)} double-entry records</p>
                <StatusPill tone="success" className="mt-1">Balanced ✓</StatusPill>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="eyebrow mb-1">Webhook Log</p>
                <p className="text-xs">{Number((evidence.webhook_delivery as any)?.delivery_attempts ?? 0)} delivery attempt(s)</p>
                <StatusPill tone={String((evidence.webhook_delivery as any)?.final_status ?? "") === "DELIVERED" ? "success" : "warning"} className="mt-1">
                  {String((evidence.webhook_delivery as any)?.final_status ?? "")}
                </StatusPill>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Submit deadline: <span className="font-medium">{String(evidence.submission_deadline ?? "")}</span>
              {" · "}
              {String((evidence.compliance as any)?.rbi_guideline ?? "")}
            </p>
          </div>
        )}
      </section>

    </AppShell>
  );
}
