import { Link } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  LayoutDashboard,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { merchant } from "@/lib/mock-data";

const nav = [
  { to: "/", label: "Money flow", icon: LayoutDashboard },
  { to: "/settlements", label: "Settlements", icon: Receipt },
  { to: "/analytics", label: "True success rate", icon: Activity },
  { to: "/holds", label: "Holds", icon: Lock },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
] as const;


export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px] gap-0 px-4 md:px-8">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border py-8 pr-6 lg:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BadgeCheck className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Clarity
            </span>
          </Link>

          <nav className="mt-10 flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-surface-foreground transition-colors hover:bg-surface"
                activeProps={{
                  className: "bg-surface font-semibold text-foreground",
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-border bg-surface p-4">
            <p className="eyebrow">Settlement cycle</p>
            <p className="mt-1.5 text-sm font-medium">{merchant.cycle}</p>
            <p className="mt-2 num text-xs text-muted-foreground">{merchant.bank}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 py-8 lg:pl-10">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
              <p className="text-sm font-medium">{merchant.name}</p>
              <p className="num text-xs text-muted-foreground">
                {merchant.mid} · {merchant.mode}
              </p>
            </div>
          </header>

          <nav className="mt-6 flex gap-1 overflow-x-auto lg:hidden">
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
  children,
}: {
  tone: "success" | "warning" | "info" | "muted" | "danger";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    success: "bg-success/12 text-success border-success/25",
    warning: "bg-warning/15 text-warning-foreground border-warning/35",
    info: "bg-info/12 text-info border-info/25",
    muted: "bg-surface text-muted-foreground border-border",
    danger: "bg-destructive/10 text-destructive border-destructive/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
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
