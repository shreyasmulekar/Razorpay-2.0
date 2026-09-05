import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * A compact metric tile that reveals its detail layer on click.
 * Collapsed = one number + one sparkline. Expanded = the full breakdown.
 */
export function ExpandCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "text-primary",
  preview,
  children,
  defaultOpen = false,
}: {
  label: string;
  value: string;
  note?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: string;
  preview?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`panel overflow-hidden transition-shadow duration-300 ${
        open ? "shadow-lift ring-1 ring-primary/20" : "hover:shadow-lift"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full cursor-pointer p-5 text-left"
      >
        <div className="flex items-center justify-between">
          <p className="eyebrow">{label}</p>
          {Icon ? <Icon className={`h-4 w-4 ${tone}`} /> : null}
        </div>
        <p className="num mt-3 text-2xl font-semibold">{value}</p>
        {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
        {preview ? <div className="mt-3">{preview}</div> : null}
        <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary">
          {open ? "Hide detail" : "Show detail"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border bg-surface/60 p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** A full-width section that starts summarised and opens into the heavy chart/table. */
export function ExpandPanel({
  title,
  summary,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <div className="mt-1.5 text-xs text-muted-foreground">{summary}</div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {badge}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border p-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
