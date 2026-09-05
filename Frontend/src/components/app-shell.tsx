import { Link } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  LayoutDashboard,
  Lock,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { merchant } from "@/lib/mock-data";
import { LiveActivityTicker, LiveStatusBanner } from "@/components/live-ticker";

const nav = [
  { to: "/", label: "Money flow", icon: LayoutDashboard },
  { to: "/settlements", label: "Settlements", icon: Receipt },
  { to: "/analytics", label: "True success rate", icon: Activity },
  { to: "/charts", label: "Visual Analytics", icon: BarChart3 },
  { to: "/holds", label: "Holds", icon: Lock },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
  { to: "/risk", label: "AI Risk Manager", icon: ShieldAlert },
  { to: "/recovery", label: "Revenue Recovery", icon: TrendingUp },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1440px] gap-0 px-4 md:px-8">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border py-6 pr-5 overflow-y-auto lg:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <BadgeCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <span className="font-display text-lg font-semibold tracking-tight">
                Clarity
              </span>
              <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">
                v2.0
              </span>
            </div>
          </Link>

          <nav className="mt-8 flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-surface-foreground transition-all duration-150 hover:bg-surface hover:translate-x-1"
                activeProps={{
                  className: "bg-surface font-semibold text-foreground shadow-xs",
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="my-5 overflow-hidden">
            <LiveActivityTicker />
          </div>

          <div className="mt-auto rounded-xl border border-border bg-surface/90 backdrop-blur-xs p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Settlement cycle</p>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-1.5 text-sm font-medium">{merchant.cycle}</p>
            <p className="mt-1 num text-xs text-muted-foreground">{merchant.bank}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 py-6 lg:pl-10">
          <LiveStatusBanner />
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl tracking-tight">{title}</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <div className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-xs px-3.5 py-2 text-right shadow-xs hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-end gap-1.5 mb-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 uppercase">
                    PROD LIVE
                  </span>
                </div>
                <p className="text-sm font-medium">{merchant.name}</p>
                <p className="num text-xs text-muted-foreground">
                  {merchant.mid} · {merchant.mode}
                </p>
              </div>
            </div>
          </header>

          <nav className="mt-6 flex gap-1 overflow-x-auto pb-2 lg:hidden">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-sm"
                activeProps={{ className: "bg-surface font-semibold" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StatusPill({
  tone,
  className = "",
  children,
}: {
  tone: "success" | "warning" | "info" | "muted" | "danger" | "destructive";
  className?: string;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    success: "bg-success/12 text-success border-success/25",
    warning: "bg-warning/15 text-warning-foreground border-warning/35",
    info: "bg-info/12 text-info border-info/25",
    muted: "bg-surface text-muted-foreground border-border",
    danger: "bg-destructive/10 text-destructive border-destructive/25",
    destructive: "bg-destructive/10 text-destructive border-destructive/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}


export function SlaBar({
  elapsed,
  total,
  tone = "info",
}: {
  elapsed: number;
  total: number;
  tone?: "info" | "warning" | "success";
}) {
  const pct = Math.min(100, Math.round((elapsed / total) * 100));
  const bar =
    tone === "warning"
      ? "bg-warning"
      : tone === "success"
        ? "bg-success"
        : "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
