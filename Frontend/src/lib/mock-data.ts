// Mock data layer for the Clarity Payments merchant console.
// Everything here is deterministic so the UI is stable across renders.

export type SettlementStatus = "settled" | "in_transit" | "scheduled" | "held";

export interface Settlement {
  id: string;
  utr: string | null;
  amount: number;
  fees: number;
  tax: number;
  net: number;
  status: SettlementStatus;
  initiatedAt: string;
  expectedAt: string;
  completedAt: string | null;
  bank: string;
  txnCount: number;
}

export interface HoldReason {
  code: string;
  label: string;
  detail: string;
}

export interface Hold {
  id: string;
  amount: number;
  openedAt: string;
  autoReleaseAt: string;
  reason: HoldReason;
  requiredDocs: { name: string; status: "pending" | "submitted" | "approved" }[];
  reviewer: string;
  slaHours: number;
  hoursElapsed: number;
}

export interface KycItem {
  id: string;
  name: string;
  category: "Identity" | "Business" | "Banking" | "Compliance";
  status: "approved" | "in_review" | "action_needed" | "not_started";
  required: boolean;
  slaHours: number;
  hoursElapsed: number;
  note: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  type: "capture" | "refund" | "fee" | "payout" | "hold" | "release";
  amount: number;
  balance: number;
}

export const merchant = {
  name: "Nimbus Threads Pvt Ltd",
  mid: "CLR_MERCH_8842190",
  mode: "Live",
  bank: "HDFC ••4471",
  cycle: "T+1, 11:00 IST daily",
};

export const balances = {
  available: 1_284_500,
  inTransit: 462_300,
  onHold: 118_750,
  scheduledToday: 341_900,
};

export const settlements: Settlement[] = [
  {
    id: "stl_9F2K1",
    utr: "HDFCN2409181123",
    amount: 412_800,
    fees: 8_256,
    tax: 1_486,
    net: 403_058,
    status: "settled",
    initiatedAt: "2026-08-26T11:00:00+05:30",
    expectedAt: "2026-08-26T11:45:00+05:30",
    completedAt: "2026-08-26T11:32:00+05:30",
    bank: "HDFC ••4471",
    txnCount: 318,
  },
  {
    id: "stl_9F2K2",
    utr: "HDFCN2409181190",
    amount: 298_400,
    fees: 5_968,
    tax: 1_074,
    net: 291_358,
    status: "in_transit",
    initiatedAt: "2026-08-27T11:00:00+05:30",
    expectedAt: "2026-08-27T11:45:00+05:30",
    completedAt: null,
    bank: "HDFC ••4471",
    txnCount: 241,
  },
  {
    id: "stl_9F2K3",
    utr: null,
    amount: 341_900,
    fees: 6_838,
    tax: 1_231,
    net: 333_831,
    status: "scheduled",
    initiatedAt: "2026-08-28T11:00:00+05:30",
    expectedAt: "2026-08-28T11:45:00+05:30",
    completedAt: null,
    bank: "HDFC ••4471",
    txnCount: 276,
  },
  {
    id: "stl_9F2K4",
    utr: null,
    amount: 118_750,
    fees: 2_375,
    tax: 428,
    net: 115_947,
    status: "held",
    initiatedAt: "2026-08-25T11:00:00+05:30",
    expectedAt: "2026-08-29T11:00:00+05:30",
    completedAt: null,
    bank: "HDFC ••4471",
    txnCount: 92,
  },
  {
    id: "stl_9F2K5",
    utr: "HDFCN2409180042",
    amount: 502_100,
    fees: 10_042,
    tax: 1_808,
    net: 490_250,
    status: "settled",
    initiatedAt: "2026-08-24T11:00:00+05:30",
    expectedAt: "2026-08-24T11:45:00+05:30",
    completedAt: "2026-08-24T11:28:00+05:30",
    bank: "HDFC ••4471",
    txnCount: 389,
  },
];

export const holds: Hold[] = [
  {
    id: "hold_4471A",
    amount: 118_750,
    openedAt: "2026-08-25T14:12:00+05:30",
    autoReleaseAt: "2026-08-29T11:00:00+05:30",
    reason: {
      code: "RISK_VELOCITY_SPIKE",
      label: "Transaction velocity 4.2x above 30-day baseline",
      detail:
        "92 captures in a 40-minute window from 3 card BINs. We hold only the delta above baseline — the remaining ₹2,23,150 settled on schedule.",
    },
    requiredDocs: [
      { name: "Invoice sample for the flagged window", status: "submitted" },
      { name: "Shipment / delivery proof (any 5 orders)", status: "pending" },
    ],
    reviewer: "Risk Pod 3 · Anita R.",
    slaHours: 72,
    hoursElapsed: 45,
  },
];

export const kycItems: KycItem[] = [
  {
    id: "kyc_pan",
    name: "Company PAN",
    category: "Identity",
    status: "approved",
    required: true,
    slaHours: 4,
    hoursElapsed: 1,
    note: "Verified against NSDL on 12 Aug.",
  },
  {
    id: "kyc_gst",
    name: "GST certificate",
    category: "Business",
    status: "approved",
    required: true,
    slaHours: 4,
    hoursElapsed: 2,
    note: "GSTIN 27AAECN1234F1Z5 active.",
  },
  {
    id: "kyc_bank",
    name: "Bank account penny-drop",
    category: "Banking",
    status: "approved",
    required: true,
    slaHours: 2,
    hoursElapsed: 1,
    note: "₹1 credited and matched to HDFC ••4471.",
  },
  {
    id: "kyc_address",
    name: "Registered address proof",
    category: "Business",
    status: "in_review",
    required: true,
    slaHours: 24,
    hoursElapsed: 9,
    note: "Geocode matched. Manual reviewer confirming the utility bill date.",
  },
  {
    id: "kyc_director",
    name: "Director KYC (2 of 2)",
    category: "Identity",
    status: "action_needed",
    required: true,
    slaHours: 24,
    hoursElapsed: 20,
    note: "Second director's Aadhaar XML failed checksum. Re-upload or use DigiLocker.",
  },
  {
    id: "kyc_refund",
    name: "Refund & shipping policy URL",
    category: "Compliance",
    status: "approved",
    required: true,
    slaHours: 4,
    hoursElapsed: 1,
    note: "Crawled and cached on 12 Aug.",
  },
  {
    id: "kyc_reserve",
    name: "Rolling reserve agreement",
    category: "Compliance",
    status: "not_started",
    required: false,
    slaHours: 24,
    hoursElapsed: 0,
    note: "Optional. Lowers per-hold amounts by pre-funding 2% for 30 days.",
  },
];

export const ledger: LedgerEntry[] = [
  {
    id: "led_01",
    date: "2026-08-27T11:00:00+05:30",
    description: "Payout initiated · stl_9F2K2",
    type: "payout",
    amount: -291_358,
    balance: 1_284_500,
  },
  {
    id: "led_02",
    date: "2026-08-27T09:41:00+05:30",
    description: "Platform fee + GST · 241 captures",
    type: "fee",
    amount: -7_042,
    balance: 1_575_858,
  },
  {
    id: "led_03",
    date: "2026-08-27T09:40:00+05:30",
    description: "Captures cleared · 241 orders",
    type: "capture",
    amount: 298_400,
    balance: 1_582_900,
  },
  {
    id: "led_04",
    date: "2026-08-26T18:22:00+05:30",
    description: "Refund · order NMB-20418",
    type: "refund",
    amount: -4_299,
    balance: 1_284_500,
  },
  {
    id: "led_05",
    date: "2026-08-25T14:12:00+05:30",
    description: "Hold opened · RISK_VELOCITY_SPIKE",
    type: "hold",
    amount: -118_750,
    balance: 1_288_799,
  },
  {
    id: "led_06",
    date: "2026-08-24T11:28:00+05:30",
    description: "Payout completed · UTR HDFCN2409180042",
    type: "release",
    amount: -490_250,
    balance: 1_407_549,
  },
];

export const settlementTrend = [
  { day: "21 Aug", settled: 388, held: 0 },
  { day: "22 Aug", settled: 421, held: 0 },
  { day: "23 Aug", settled: 396, held: 12 },
  { day: "24 Aug", settled: 502, held: 0 },
  { day: "25 Aug", settled: 223, held: 118 },
  { day: "26 Aug", settled: 412, held: 0 },
  { day: "27 Aug", settled: 298, held: 0 },
];

export const promises = [
  {
    label: "Payouts landed within promised window",
    value: "99.4%",
    sub: "Last 90 days · 268 of 270 payouts",
  },
  { label: "Median payout time", value: "31 min", sub: "From 11:00 IST cutoff" },
  { label: "Funds held right now", value: "7.6%", sub: "Of today's gross volume" },
  { label: "Avg. hold resolution", value: "2.1 days", sub: "SLA cap is 3 days" },
];

export function formatINR(paise: number): string {
  const abs = Math.abs(paise);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(abs);
  return `${paise < 0 ? "-" : ""}₹${formatted}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// --- True success rate analytics -------------------------------------------
// Counters the "vanity success rate" problem: gateways report
// (successes / successes+explicit_failures) and quietly drop timeouts,
// abandoned redirects and webhook-lost orders out of the denominator.

export interface MethodStats {
  method: string;
  attempts: number;
  successes: number;
  issuerDeclines: number;
  gatewayErrors: number;
  timeouts: number;
  abandoned: number;
  webhookLost: number;
  p95LatencyMs: number;
}

export const methodStats: MethodStats[] = [
  {
    method: "UPI Intent",
    attempts: 8420,
    successes: 7361,
    issuerDeclines: 512,
    gatewayErrors: 61,
    timeouts: 214,
    abandoned: 248,
    webhookLost: 24,
    p95LatencyMs: 4100,
  },
  {
    method: "UPI Collect",
    attempts: 3110,
    successes: 2377,
    issuerDeclines: 188,
    gatewayErrors: 33,
    timeouts: 301,
    abandoned: 198,
    webhookLost: 13,
    p95LatencyMs: 9800,
  },
  {
    method: "Cards (domestic)",
    attempts: 5240,
    successes: 4602,
    issuerDeclines: 402,
    gatewayErrors: 44,
    timeouts: 96,
    abandoned: 88,
    webhookLost: 8,
    p95LatencyMs: 5600,
  },
  {
    method: "Netbanking",
    attempts: 1890,
    successes: 1502,
    issuerDeclines: 121,
    gatewayErrors: 29,
    timeouts: 142,
    abandoned: 92,
    webhookLost: 4,
    p95LatencyMs: 11200,
  },
  {
    method: "Wallets",
    attempts: 970,
    successes: 862,
    issuerDeclines: 51,
    gatewayErrors: 9,
    timeouts: 28,
    abandoned: 18,
    webhookLost: 2,
    p95LatencyMs: 3900,
  },
];

export interface RateSummary {
  attempts: number;
  successes: number;
  issuerDeclines: number;
  gatewayErrors: number;
  timeouts: number;
  abandoned: number;
  webhookLost: number;
  /** attempts / successes, every attempt in the denominator */
  trueRate: number;
  /** the flattering number most gateways publish */
  vanityRate: number;
}

export function summarize(rows: MethodStats[]): RateSummary {
  const sum = (k: keyof Omit<MethodStats, "method" | "p95LatencyMs">) =>
    rows.reduce((a, r) => a + r[k], 0);
  const attempts = sum("attempts");
  const successes = sum("successes");
  const issuerDeclines = sum("issuerDeclines");
  const gatewayErrors = sum("gatewayErrors");
  const timeouts = sum("timeouts");
  const abandoned = sum("abandoned");
  const webhookLost = sum("webhookLost");
  return {
    attempts,
    successes,
    issuerDeclines,
    gatewayErrors,
    timeouts,
    abandoned,
    webhookLost,
    trueRate: successes / attempts,
    vanityRate: successes / (successes + issuerDeclines + gatewayErrors),
  };
}

export const successRateTrend = [
  { day: "21 Aug", trueRate: 0.881, vanityRate: 0.943 },
  { day: "22 Aug", trueRate: 0.874, vanityRate: 0.941 },
  { day: "23 Aug", trueRate: 0.842, vanityRate: 0.938 },
  { day: "24 Aug", trueRate: 0.869, vanityRate: 0.945 },
  { day: "25 Aug", trueRate: 0.793, vanityRate: 0.929 },
  { day: "26 Aug", trueRate: 0.858, vanityRate: 0.94 },
  { day: "27 Aug", trueRate: 0.871, vanityRate: 0.946 },
];

export interface IncidentRow {
  id: string;
  window: string;
  surface: string;
  impact: string;
  status: "open" | "mitigated" | "resolved";
  detail: string;
}

export const incidents: IncidentRow[] = [
  {
    id: "inc_2201",
    window: "25 Aug · 19:40–20:25 IST",
    surface: "UPI Collect (PSP: Bank B)",
    impact: "301 attempts timed out, 0 marked failed by the PSP",
    status: "resolved",
    detail:
      "PSP stopped returning terminal callbacks. We reconciled every hung order within 12 minutes and refunded 41 debited-but-unconfirmed customers automatically.",
  },
  {
    id: "inc_2214",
    window: "26 Aug · 11:02–11:19 IST",
    surface: "Webhook delivery (store: nimbus-threads.in)",
    impact: "24 order webhooks not acknowledged by merchant endpoint",
    status: "mitigated",
    detail:
      "Endpoint returned 502 under load. All 24 events replayed with exponential backoff; 24/24 acknowledged. Replay is on by default — orders are never silently lost.",
  },
  {
    id: "inc_2219",
    window: "27 Aug · 09:30 IST onward",
    surface: "Netbanking (Bank D)",
    impact: "p95 redirect latency 11.2s, abandonment up 3.1pp",
    status: "open",
    detail:
      "Bank-side slowness. Checkout now de-prioritises Bank D in the netbanking list and surfaces UPI first until p95 recovers below 6s.",
  },
];

export function formatPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}
