import { useState, useEffect } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Zap,
  Radio,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "./app-shell";

export interface LiveEvent {
  id: string;
  time: string;
  type: "settlement" | "recovery" | "risk_flag" | "capture";
  amount: string;
  merchant: string;
  method: string;
  status: "SETTLED" | "RECOVERED" | "FLAGGED" | "CAPTURED";
}

const initialEvents: LiveEvent[] = [
  { id: "tx_1", time: "Just now", type: "recovery", amount: "₹48,200", merchant: "nimbus_threads", method: "Webhook Replayed", status: "RECOVERED" },
  { id: "tx_2", time: "12s ago", type: "capture", amount: "₹3,499", merchant: "apex_retail", method: "UPI Intent", status: "SETTLED" },
  { id: "tx_3", time: "28s ago", type: "capture", amount: "₹12,850", merchant: "zenith_saas", method: "Domestic Card", status: "CAPTURED" },
  { id: "tx_4", time: "45s ago", type: "recovery", amount: "₹1,24,000", merchant: "orbit_pay", method: "Bank Probe Auto-Settle", status: "RECOVERED" },
  { id: "tx_5", time: "1m ago", type: "risk_flag", amount: "₹2,80,000", merchant: "vlebazaar_fake", method: "Z-Score Velocity Flag", status: "FLAGGED" },
];

export function LiveActivityTicker() {
  const [events, setEvents] = useState<LiveEvent[]>(initialEvents);
  const [isLive, setIsLive] = useState(true);

  // Auto-stream random simulated transactions every 8 seconds to give that bustling fintech feel
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const merchants = ["nimbus_threads", "apex_retail", "zenith_saas", "orbit_pay", "stayclassy"];
      const methods = ["UPI Intent", "HDFC Netbanking", "ICICI 3DS Card", "UPI AutoPay", "Webhook Replay"];
      const randAmt = (Math.floor(Math.random() * 850) + 15) * 100;
      const isRecovery = Math.random() > 0.65;
      
      const newEvent: LiveEvent = {
        id: `tx_${Date.now().toString(36)}`,
        time: "Just now",
        type: isRecovery ? "recovery" : "capture",
        amount: `₹${randAmt.toLocaleString("en-IN")}`,
        merchant: merchants[Math.floor(Math.random() * merchants.length)]!,
        method: methods[Math.floor(Math.random() * methods.length)]!,
        status: isRecovery ? "RECOVERED" : "SETTLED",
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 5)]);
    }, 9000);

    return () => clearInterval(interval);
  }, [isLive]);

  const triggerSimulatedPayment = () => {
    const newTx: LiveEvent = {
      id: `sim_${Date.now().toString(36)}`,
      time: "Just now",
      type: "capture",
      amount: "₹14,999",
      merchant: "nimbus_threads",
      method: "Instant UPI Intent",
      status: "SETTLED",
    };
    setEvents((prev) => [newTx, ...prev.slice(0, 5)]);
    toast.success("Payment Intent Captured & Cleared!", {
      description: "₹14,999 settled to Nimbus Threads with zero double-charge risk",
    });
  };

  const triggerAutoRecoverySim = () => {
    const newTx: LiveEvent = {
      id: `rec_${Date.now().toString(36)}`,
      time: "Just now",
      type: "recovery",
      amount: "₹68,500",
      merchant: "nimbus_threads",
      method: "AI Probe & Settle",
      status: "RECOVERED",
    };
    setEvents((prev) => [newTx, ...prev.slice(0, 5)]);
    toast.success("AI Revenue Recovered!", {
      description: "Recovered ₹68,500 hung transaction from bank callback timeout",
    });
  };

  return (
    <div className="panel border-primary/20 bg-gradient-to-b from-surface/80 to-surface/40 p-4">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <p className="eyebrow text-foreground">Live Gateway Stream</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerSimulatedPayment}
            className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-surface-foreground hover:bg-surface hover:text-foreground transition-all flex items-center gap-1"
            title="Simulate a live payment capture"
          >
            <Zap className="h-3 w-3 text-primary" />
            + Pay
          </button>
          <button
            onClick={triggerAutoRecoverySim}
            className="rounded-md border border-success/30 bg-success/10 px-2 py-1 text-[11px] font-medium text-success hover:bg-success/20 transition-all flex items-center gap-1"
            title="Simulate an AI recovery intervention"
          >
            <Sparkles className="h-3 w-3 text-success" />
            + Recover
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {events.slice(0, 4).map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-xs transition-all hover:border-primary/40 hover:bg-card"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{e.amount}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    e.status === "RECOVERED"
                      ? "bg-success/15 text-success"
                      : e.status === "FLAGGED"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {e.status}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {e.merchant} · {e.method}
              </p>
            </div>
            <span className="num text-[10px] text-muted-foreground shrink-0 ml-2">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiveStatusBanner() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-surface/60 to-success/5 px-4 py-2.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-foreground tracking-tight flex items-center gap-1.5">
          GATEWAY OPERATIONAL
        </span>
        <span className="hidden sm:inline text-border">•</span>
        <span className="hidden sm:inline">
          NPCI UPI Switch: <strong className="text-foreground">99.98% SLA</strong>
        </span>
        <span className="hidden md:inline text-border">•</span>
        <span className="hidden md:inline">
          AI Risk Sentinel: <strong className="text-success">Active Defense</strong>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden lg:inline">
          RBI Escrow Window: <strong className="text-info">T+1 Auto-Clear</strong>
        </span>
        <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-foreground font-medium shadow-xs">
          LATENCY: 42ms
        </span>
      </div>
    </div>
  );
}
