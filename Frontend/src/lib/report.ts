/** Shared shape for anything that can be drilled into, exported or printed. */
export interface Dataset {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  /** Optional index of the numeric column that should be charted in a drilldown. */
  chartColumn?: number;
  note?: string;
}

function escapeCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function datasetToCsv(d: Dataset): string {
  return [d.columns, ...d.rows].map((r) => r.map(escapeCell).join(",")).join("\n");
}

export function datasetsToCsv(datasets: Dataset[]): string {
  return datasets
    .map((d) => `${escapeCell(d.title)}\n${datasetToCsv(d)}`)
    .join("\n\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * PDF export without a bundled PDF engine: render a clean report document and
 * hand it to the browser's own "Save as PDF" print pipeline.
 */
export function printReport(title: string, subtitle: string, datasets: Dataset[]) {
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return false;
  const esc = (s: string | number) =>
    String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  const stamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const tables = datasets
    .map(
      (d) => `<section>
      <h2>${esc(d.title)}</h2>
      ${d.note ? `<p class="note">${esc(d.note)}</p>` : ""}
      <table>
        <thead><tr>${d.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${d.rows
          .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody>
      </table>
    </section>`,
    )
    .join("");

  win.document.write(`<!doctype html><html><head><meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; color:#111827; margin:32px; }
    h1 { font-size:22px; margin:0 0 4px; }
    .sub { color:#6b7280; font-size:12px; margin:0 0 4px; }
    .stamp { color:#9ca3af; font-size:11px; margin:0 0 24px; }
    section { page-break-inside: avoid; margin-bottom:26px; }
    h2 { font-size:14px; margin:0 0 8px; }
    .note { font-size:11px; color:#6b7280; margin:0 0 8px; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    th, td { border-bottom:1px solid #e5e7eb; padding:6px 8px; text-align:left; }
    th { background:#f9fafb; font-weight:600; text-transform:uppercase; letter-spacing:.04em; font-size:10px; color:#6b7280; }
    td:not(:first-child), th:not(:first-child) { text-align:right; }
    @media print { body { margin:16mm; } }
  </style></head><body>
  <h1>${esc(title)}</h1>
  <p class="sub">${esc(subtitle)}</p>
  <p class="stamp">Generated ${esc(stamp)} IST · Clarity Payments</p>
  ${tables}
  <script>window.onload = () => { window.focus(); window.print(); };<\/script>
  </body></html>`);
  win.document.close();
  return true;
}
