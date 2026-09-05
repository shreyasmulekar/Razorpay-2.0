import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { datasetsToCsv, downloadCsv, printReport, type Dataset } from "@/lib/report";

/** Exports whatever the current dashboard is showing, including expanded tables. */
export function ExportMenu({
  title,
  subtitle,
  datasets,
  filename,
}: {
  title: string;
  subtitle: string;
  datasets: Dataset[];
  filename: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {datasets.length} tables from this view
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            downloadCsv(filename, datasetsToCsv(datasets));
            toast.success("CSV downloaded", { description: `${datasets.length} tables exported.` });
          }}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const ok = printReport(title, subtitle, datasets);
            if (ok) toast.success("Report ready", { description: "Choose \u201cSave as PDF\u201d in the print dialog." });
            else toast.error("Popup blocked", { description: "Allow popups to export a PDF." });
          }}
        >
          <FileText className="mr-2 h-4 w-4" /> Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
