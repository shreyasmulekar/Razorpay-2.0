# ⚡ Clarity Payments (Razorpay 2.0)

> **Next-Generation Intelligent Payment Infrastructure** — Built with double-entry ledger transparency, automated AI revenue recovery, defensive fraud detection with explicit false-positive cost accounting, and real-time operational analytics.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TanStack](https://img.shields.io/badge/TanStack-Router%20%26%20Start-FF4154?logo=reacttable&logoColor=white)](https://tanstack.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features by Track](#-key-features-by-track)
  - [🛡️ Track 2: AI Risk Manager](#️-track-2-ai-risk-manager)
  - [💰 Track 3: AI Revenue Recovery](#-track-3-ai-revenue-recovery)
  - [📊 Visual Analytics Suite (8 Custom Charts)](#-visual-analytics-suite-8-custom-charts)
  - [⚡ Live Operational Dynamism & Ticker](#-live-operational-dynamism--ticker)
- [System Architecture](#-system-architecture)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Verification & Testing](#-verification--testing)
- [Project Structure](#-project-structure)

---

## 🌟 Overview

Legacy payment gateways often suffer from three core operational blind spots:
1. **Opaque Settlement Delays & Silent Holds**: Merchants don't know why funds are held or when they will be credited.
2. **Aggressive, Unmeasured Fraud Blocks**: Black-box risk rules block legitimate transactions, costing businesses massive revenue in hidden false-positive penalties.
3. **Unrecovered Hung Transactions**: Intermittent network dropouts, unacknowledged webhooks, and bank timeouts cause payments to fail permanently without automated intervention.

**Clarity Payments (Razorpay 2.0)** addresses these fundamental challenges with an auditable double-entry ledger, defensive risk modeling that transparently accounts for false-positive costs in ₹ INR, an automated revenue recovery pipeline with strict stopping rules, and a live, responsive merchant console.

---

## 🎯 Key Features by Track

### 🛡️ Track 2: AI Risk Manager
*Defense-only, honest precision/recall evaluation, and explicit false-positive cost calculation in ₹ INR.*

- **Fraud Spike Detector** (`risk_engine.py`):
  - Group-by-merchant rolling $z$-score velocity anomaly detector.
  - Flags abnormal burst transactions when $z \ge 2.5\sigma$ above historical baseline.
- **Abuse Ring Sentinel** (`risk_engine.py`):
  - Graph-based clustering detecting coordinated fraudulent merchant rings sharing cross-border high-risk transaction anomalies.
- **Return-Risk Scorer** (`risk_engine.py`):
  - Multi-factor model scoring chargeback and return probability ($0.0 - 1.0$) with automated mitigation guidance (e.g., *Capture immediately*, *Request 3DS re-auth*, *Flag for review*).
- **Honest Model Evaluation & False-Positive Cost**:
  - Evaluated on a 500-sample test batch with true-positive, false-positive, true-negative, and false-negative confusion matrix.
  - Explicitly penalizes false alarms at **₹2,500 per blocked legitimate merchant**, discouraging overly aggressive black-box filters.
- **Chargeback Evidence Packager** (`chargeback_service.py`):
  - Generates bank-submission-ready dispute dossiers complete with balanced double-entry ledger proofs, HMAC-signed webhook delivery records, and RBI compliance timelines.
- **Dynamic Tiered Rolling Reserve** (`risk_reserve_service.py`):
  - Automatically calculates and adjusts rolling buffer reserves (2%, 5%, 10%, 15%) tied to real-time merchant chargeback and dispute ratios.

---

### 💰 Track 3: AI Revenue Recovery
*Identifies failure root causes, applies compliant stopping rules, and shows measured money recovered across batches with an immutable audit trail.*

- **Failure Cause Classifier** (`revenue_recovery_service.py`):
  - Granular classification into `WEBHOOK_LOSS`, `SILENT_TIMEOUT`, `ISSUER_DECLINE`, `CHECKOUT_ABANDONMENT`, and `NACH_CANCELLATION`.
- **Stopping Rules Engine** (`revenue_recovery_service.py`):
  - **Max Retries**: Strict 3-attempt ceiling per transaction.
  - **Auto-Recovery Threshold**: Transactions $> ₹200,000$ are automatically escalated to manual human review to eliminate automated financial risk.
  - **Terminal State Lock**: Refuses to retry already refunded or settling transactions.
  - **Mandate Restrictions**: Immediately halts retries if customer cancelled recurring mandate.
- **Batch Recovery Execution**:
  - Processes batches of 10 to 500 recoverable payments.
  - Auto-replays unacknowledged capture webhooks and initiates bank-side terminal probe queries.
- **Mandate Retry Sequencer**:
  - Implements RBI PA/PG compliant recurring retry intervals (+24h, +48h, +72h) with exhaustion enforcement.
- **Measured Money Recovered & Audit Log**:
  - Live headline card displaying exact ₹ INR recovered across batches.
  - Step-by-step immutable audit log recording every automated action, state change, and stopping rule.

---

### 📊 Visual Analytics Suite (8 Custom Charts)
*Interactive, theme-aware visualizations built with Recharts across both a dedicated `/charts` hub and contextual dashboard views:*

| Chart Type | Component | Purpose / Business Metric |
| :--- | :--- | :--- |
| **Topological Sankey** | `<MoneyFlowSankeyChart />` | End-to-end fund lifecycle: Gross Inflow $\rightarrow$ Captured/Declines $\rightarrow$ Merchant Settlement, Reserves, Fees, & Refunds. |
| **Stacked Bar** | `<PaymentOutcomesStackedBarChart />` | Daily attempt outcomes classified by Success, Decline, Timeout, Gateway Error, & Webhook Loss. |
| **Donut / Pie** | `<PaymentMethodsPieChart />` | Payment method market share (UPI Intent, Domestic Cards, UPI Collect, Netbanking, Wallets). |
| **Multiple Line** | `<MultipleLineChart />` | Compares True Success Rate vs Vanity Filtered Rate vs Acquiring Bank Clearance, exposing the "Rate Illusion Gap". |
| **Single Line** | `<LatencyLineChart />` | Hourly p95 transaction confirmation latency (ms) measured against the 5,000ms SLA target. |
| **Area Chart** | `<CumulativeVolumeAreaChart />` | Cumulative Gross Processed Volume (GPV in ₹ Lakhs) with gradient fill. |
| **Stacked Area** | `<StackedAreaChart />` | Multi-layer liquidity allocation over time: Available Settlements, In-Transit Funds, Reserve Buffer, & Anomaly Holds. |
| **6D Radar** | `<RiskRadarChart />` | Benchmarks merchant posture across 6 risk dimensions: Velocity Safety, 3DS Auth Rate, Webhook Health, Dispute Defense, Mandate Success, & Cross-Border Auth. |

---

### ⚡ Live Operational Dynamism & Ticker

- **Live Operational Radar Status Banner**:
  - Embedded at the top of every dashboard view.
  - Displays real-time **NPCI UPI Switch SLA (99.98%)**, active AI Risk Sentinel status, RBI T+1 Escrow window tag, and live p95 confirmation latency (**42ms**).
- **Live Gateway Activity Stream & Ticker**:
  - Streams incoming transactions, settlements, and AI recoveries every 9 seconds.
  - **`+ Pay`** Button: Simulates an instant UPI Intent payment capture and triggers Sonner toast notification.
  - **`+ Recover`** Button: Simulates an instant AI probe-and-settle recovery intervention and updates the live feed.
- **Production Live Status Beacon**:
  - Merchant header card features an active emerald radar beacon and `PROD LIVE` indicator.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MERCHANT FRONTEND (Vite)                       │
│    TanStack Router · React 19 · Recharts · Tailwind v4 · Sonner Toasts  │
│  [Money Flow]  [Settlements]  [Visual Analytics]  [Risk]  [Recovery]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON API
┌───────────────────────────────────▼────────────────────────────────────┐
│                       CORE BACKEND (FastAPI)                          │
│                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────┐   │
│   │   Track 2: Risk Engine    │    │   Track 3: Revenue Recovery   │   │
│   │  • Rolling Z-Score Anomaly│    │  • Failure Cause Classifier   │   │
│   │  • Abuse Ring Graph       │    │  • Stopping Rules Engine      │   │
│   │  • Return-Risk Scorer     │    │  • Batch Recovery Executor    │   │
│   │  • Dispute Evidence Dossier│   │  • Mandate Retry Sequencer    │   │
│   │  • Dynamic Rolling Reserve│    │  • Audit Trail Logger         │   │
│   └─────────────┬─────────────┘    └───────────────┬───────────────┘   │
│                 │                                  │                   │
│                 └─────────────────┬────────────────┘                   │
│                                   │                                    │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │                   DOUBLE-ENTRY CORE LEDGER                     │   │
│   │      Payments · Balances · Settlements · Disputes · Holds      │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  SQLite / Postgres  │
                         │  gateway_core.db    │
                         └─────────────────────┘
```

---

## 🔌 API Reference

The backend exposes interactive Swagger documentation at `http://localhost:8000/docs`.

### Track 2: AI Risk Manager (`/v1/risk/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/risk/spikes` | Detects abnormal transaction velocity spikes using rolling z-score. |
| `GET` | `/v1/risk/return-scores` | Returns return-risk scoring and mitigation advice for recent payments. |
| `GET` | `/v1/risk/abuse-rings` | Detects coordinated merchant fraud rings sharing high-risk signals. |
| `GET` | `/v1/risk/portfolio` | Returns overall merchant portfolio health and chargeback ratios. |
| `GET` | `/v1/risk/metrics` | Honest confusion matrix and INR false-positive cost evaluation. |
| `POST` | `/v1/risk/evidence/{payment_id}` | Pre-assembles a bank-ready dispute response packet. |
| `GET` | `/v1/risk/reserves/{merchant_id}` | Dynamic tiered rolling reserve calculation. |

### Track 3: AI Revenue Recovery (`/v1/recovery/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/recovery/scan` | Scans payments, categorizing recoverable vs non-recoverable funds. |
| `GET` | `/v1/recovery/failure-breakdown`| Returns failure distribution across all root causes. |
| `POST` | `/v1/recovery/execute-batch` | Executes automated recovery interventions with stopping rules. |
| `GET` | `/v1/recovery/audit-trail` | Returns the immutable recovery audit trail and total ₹ recovered. |
| `POST` | `/v1/recovery/mandate-retry` | Schedules RBI-compliant recurring mandate retries (+24h, +48h, +72h). |

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

---

### Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (optional, `.env`):
   ```ini
   DATABASE_URL=sqlite+aiosqlite:///./gateway_core.db
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The API will be live at `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`).*

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The merchant console will be live at `http://localhost:8081` (or `http://localhost:5173`).*

---

## 🧪 Verification & Testing

### Automated Health Checks
- **TypeScript Type Verification**:
  ```bash
  cd Frontend
  npx tsc --noEmit
  ```
  *(Passes with 0 errors)*

- **Frontend Production Bundle Build**:
  ```bash
  cd Frontend
  npm run build
  ```
  *(Clean compilation with code 0)*

- **Backend End-to-End Suite**:
  ```bash
  cd Backend
  python load_test.py
  ```

---

## 📁 Project Structure

```
Razorpay-2.0/
├── README.md                           # Main project documentation
├── .gitignore                          # Git ignore rules for Python, Node, & .env
│
├── Backend/                            # Core FastAPI Gateway Service
│   ├── app/
│   │   ├── config.py                   # Environment settings & Pydantic models
│   │   ├── db.py                       # Async SQLite / PostgreSQL session provider
│   │   ├── main.py                     # App entry point, CORS, and router registration
│   │   ├── routers/
│   │   │   ├── risk_router.py          # Track 2 API endpoints
│   │   │   └── recovery_router.py      # Track 3 API endpoints
│   │   └── services/
│   │       ├── risk_engine.py          # Fraud spike, abuse ring, and return risk logic
│   │       ├── chargeback_service.py   # Dispute evidence packager
│   │       ├── risk_reserve_service.py # Tiered rolling reserve calculator
│   │       └── revenue_recovery_service.py # Recovery classifier, stopping rules, sequencer
│   ├── load_test.py                    # High-concurrency payment simulator
│   └── requirements.txt                # Python dependencies
│
└── Frontend/                           # TanStack Start / React Merchant Console
    ├── src/
    │   ├── components/
    │   │   ├── advanced-charts.tsx     # 8 Recharts components (Sankey, Radar, etc.)
    │   │   ├── app-shell.tsx           # Global navigation, HUD banner & sidebar
    │   │   ├── live-ticker.tsx         # Streaming transaction ticker & simulation buttons
    │   │   ├── charts.tsx              # Sparklines, bars, and compact visual primitives
    │   │   ├── dashboard-states.tsx    # Skeletons, empty states, and error boundaries
    │   │   ├── drilldown.tsx           # Transaction modal inspection
    │   │   └── export-menu.tsx         # CSV / JSON dataset download dialog
    │   ├── routes/
    │   │   ├── index.tsx               # Money Flow overview
    │   │   ├── charts.tsx              # Visual Analytics Hub (8 Visualizations)
    │   │   ├── risk.tsx                # AI Risk Manager Dashboard
    │   │   ├── recovery.tsx            # AI Revenue Recovery Dashboard
    │   │   ├── analytics.tsx           # True Success Rate analytics
    │   │   ├── settlements.tsx         # Settlement cycle status & UTRs
    │   │   ├── holds.tsx               # Reason-coded holds & SLA timers
    │   │   └── verification.tsx        # KYC & merchant verification
    │   └── styles.css                  # Tailwind CSS v4 design tokens & utilities
    ├── package.json
    └── vite.config.ts
```

---

## 📜 License

Distributed under the MIT License.
