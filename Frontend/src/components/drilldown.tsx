import { Download, Maximize2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { datasetToCsv, downloadCsv, type Dataset } from "@/lib/report";

function isNumeric(v: string | number) {
  return typeof v === "number";
}

/** Bar series with a live hover tooltip, drawn from a dataset column. */
function SeriesChart({ dataset }: { dataset: Dataset }) {
  const col = dataset.chartColumn ?? 1;
  const [hover, setHover] = useState<number | null>(null);
  const values = dataset.rows.map((r) => (typeof r[col] === "number" ? (r[col] as number) : 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  if (!values.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface/60 p-4">
      <div className="flex items-end justify-between">
        <p className="eyebrow">{dataset.columns[col]} by {dataset.columns[0]}</p>
        <p className="num text-[11px] text-muted-foreground">
          max {max.toLocaleString("en-IN")} · min {min.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="relative mt-4 flex h-40 items-end gap-1.5">
        {values.map((v, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="group relative flex h-full flex-1 cursor-pointer items-end"
            aria-label={`${dataset.rows[i]![0]}: ${v}`}
          >
            <span
              className={`w-full rounded-t-md transition-colors ${
                hover === i ? "bg-primary" : "bg-primary/60"
              }`}
              style={{ height: `${Math.max(4, ((v - min) / span) * 100 || 4)}%` }}
            />
          </button>
        ))}
        {hover !== null ? (
          <div
            className="pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 shadow-lift"
            style={{ left: `${((hover + 0.5) / values.length) * 100}%`, transform: "translate(-50%,-100%)" }}
          >
            <p className="text-[11px] font-semibold">{String(dataset.rows[hover]![0])}</p>
            {dataset.columns.slice(1).map((c, ci) => (
              <p key={c} className="num whitespace-nowrap text-[11px] text-muted-foreground">
                {c}:{" "}
                <span className="text-foreground">
                  {typeof dataset.rows[hover]![ci + 1] === "number"
                    ? (dataset.rows[hover]![ci + 1] as number).toLocaleString("en-IN")
                    : String(dataset.rows[hover]![ci + 1])}
                </span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex gap-1.5">
        {dataset.rows.map((r, i) => (
          <span key={i} className="num flex-1 truncate text-center text-[10px] text-muted-foreground">
            {String(r[0])}
          </span>
        ))}
      </div>
    </div>
  );
}

function DataTable({ dataset }: { dataset: Dataset }) {
  const totals = dataset.columns.map((_, ci) =>
    ci === 0
      ? "Total"
      : dataset.rows.every((r) => isNumeric(r[ci]!))
        ? dataset.rows.reduce((a, r) => a + (r[ci] as number), 0)
        : "",
  );
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left">
            {dataset.columns.map((c, i) => (
              <th key={c} className={`eyebrow px-3 py-2.5 font-semibold ${i ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-surface/70">
              {r.map((c, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2.5 ${ci ? "num text-right tabular-nums" : "font-medium"}`}
                >
                  {isNumeric(c) ? (c as number).toLocaleString("en-IN") : c}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-surface/60">
            {totals.map((t, i) => (
              <td
                key={i}
                className={`px-3 py-2.5 text-xs font-semibold ${i ? "num text-right" : ""}`}
              >
                {typeof t === "number" ? t.toLocaleString("en-IN") : t}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * "Open the raw numbers" affordance used inside every expandable card/panel.
 * Shows the underlying series with tooltips plus the exact aggregate inputs.
 */
export function DrilldownButton({
  title,
  description,
  datasets,
  label = "Open raw numbers",
}: {
  title: string;
  description: string;
  datasets: Dataset[];
  label?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-surface-foreground transition-colors hover:bg-surface"
        >
          <Maximize2 className="h-3.5 w-3.5" /> {label}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {datasets.map((d) => (
            <div key={d.title} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{d.title}</h3>
                  {d.note ? (
                    <p className="text-xs text-muted-foreground">{d.note}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(d.title.toLowerCase().replace(/\W+/g, "-"), datasetToCsv(d))
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-surface"
                >
                  <Download className="h-3.5 w-3.5" /> CSV
                </button>
              </div>
              {d.rows.some((r) => isNumeric(r[d.chartColumn ?? 1]!)) ? (
                <SeriesChart dataset={d} />
              ) : null}
              <DataTable dataset={d} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
