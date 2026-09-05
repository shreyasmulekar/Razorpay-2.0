import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder that mirrors the tile + panel rhythm of the dashboards. */
export function DashboardSkeleton({ tiles = 4, panels = 3 }: { tiles?: number; panels?: number }) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: tiles }).map((_, i) => (
          <div key={i} className="panel space-y-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6">
        {Array.from({ length: panels }).map((_, i) => (
          <div key={i} className="panel space-y-3 p-6">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-3 w-80 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Route-level error boundary UI: never a blank screen mid-payout-check. */
export function DashboardError({ error, view }: { error: Error; view: string }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20" role="alert">
      <div className="panel p-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">We couldn&apos;t load {view}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your money is unaffected — this is a display failure, not a transaction failure. The exact
          error is below so support never has to ask you to &ldquo;try again later&rdquo;.
        </p>
        <pre className="num mt-4 overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs text-surface-foreground">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => router.invalidate()}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" /> Reload this view
        </button>
      </div>
    </div>
  );
}

export function DashboardNotFound({ view }: { view: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <div className="panel p-8">
        <h1 className="text-xl font-semibold">Nothing to show in {view}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No records matched this window. Widen the date range or check back after the next
          settlement cycle.
        </p>
      </div>
    </div>
  );
}
