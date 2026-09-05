# ⚡ Clarity Payments — Merchant Console

Frontend merchant dashboard for **Clarity Payments (Razorpay 2.0)**. Built with React 19, TanStack Start & Router, Tailwind CSS v4, Recharts, and Sonner.

---

## 🚀 Quickstart

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run type check
npx tsc --noEmit

# Production build
npm run build
```

---

## 🧭 Routes & Features

- `/` — **Money Flow**: Live balance breakdown, settlement journey, in-transit status, and double-entry ledger drilldown.
- `/charts` — **Visual Analytics & Intelligence**: 8 interactive financial visualizations (Topological Sankey diagram, Daily Stacked Bar, Market Share Donut, Rate Illusion Multi-Line, Confirmation Latency, Cumulative GPV Area, Stacked Liquidity Area, and 6D Risk Radar).
- `/risk` — **AI Risk Manager (Track 2)**: Fraud velocity spike detector, abuse ring sentinel, return risk scorer, and honest confusion matrix with ₹ INR false-positive cost accounting.
- `/recovery` — **AI Revenue Recovery (Track 3)**: Failure cause classifier, stopping rules monitor, batch recovery executor, mandate retry sequencer, and immutable action audit log with live ₹ recovered totals.
- `/analytics` — **True Success Rate**: Unfiltered vs vanity conversion metrics.
- `/settlements` — **Settlements & Payouts**: UTR references and bank credit status.
- `/holds` — **Open Holds**: Reason-coded holds with strict SLA countdowns.
- `/verification` — **Merchant Compliance**: KYC and business account status.

---

## 🎨 Tech Stack
- **Framework**: TanStack Start + Vite
- **UI & Styling**: React 19, Tailwind CSS v4 (Oklch design tokens), Lucide Icons
- **Charts**: Recharts (Custom SVG topological Sankey, Radar, Stacked Area, etc.)
- **Notifications**: Sonner Toasts
