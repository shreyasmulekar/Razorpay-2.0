# 🚀 NextGen Fintech Gateway (Razorpay 2.0)

An enterprise-grade, fault-tolerant payment gateway and risk analytics engine designed to capture hidden transaction failures, silent timeouts, and reconciliation discrepancies that traditional payment gateways miss.

---

## 🛠️ Tech Stack & Architecture

This project is structured as a **Monorepo** consisting of a decoupled Python backend and a modern React frontend:

* **Backend:** Python, FastAPI, SQLAlchemy, SQLite, Uvicorn
* **Frontend:** React, Vite, Tailwind CSS, TypeScript, Lovable UI components
* **Core Systems:** Custom ledger accounting engine, automated reconciliation worker, and dynamic risk/routing calculation layer.

---

## 📂 Repository & Folder Structure

```text
Razorpay-2.0/
├── Backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── idempotency.py       # Ensures safe, once-only transaction processing
│   │   │   ├── security.py          # Authentication and token management utilities
│   │   │   └── state_machine.py     # Manages strict payment lifecycle state transitions
│   │   ├── models/
│   │   │   ├── ledger.py            # Double-entry ledger database models
│   │   │   ├── merchant.py          # Merchant profile and configuration schemas
│   │   │   └── payment.py           # Payment intent and transaction data models
│   │   ├── services/
│   │   │   ├── ledger_service.py    # Core accounting and balance calculation logic
│   │   │   ├── mandate_service.py   # Recurring payment and subscription mandate handling
│   │   │   ├── risk_engine.py       # Fraud scoring and risk assessment algorithms
│   │   │   ├── risk_reserve_service.py # Dynamic risk reserve calculations
│   │   │   └── routing_engine.py    # Smart payment gateway routing logic
│   │   ├── workers/
│   │   │   ├── reconciliation_worker.py # Background jobs for ledger matching
│   │   │   └── webhook_worker.py    # Async webhook dispatching system
│   │   ├── config.py                # App configuration and environment variables
│   │   ├── dashboard.py             # Aggregated analytics metrics provider
│   │   └── main.py                  # FastAPI entry point and router bindings
│   ├── docker-compose.yml           # Container orchestration setup
│   └── requirements.txt             # Python dependency manifest
│
└── Frontend/
    ├── public/                      # Static assets, icons, and robots file
    ├── src/
    │   ├── components/
    │   │   ├── app-shell.tsx        # Main application layout wrapper
    │   │   └── ui/                  # Reusable design system components (shadcn/ui)
    │   ├── hooks/                   # Custom React hooks (e.g., mobile detection)
    │   ├── integrations/            # Supabase and external API connectors
    │   ├── lib/                     # Client-side analytics, helpers, and mock datasets
    │   ├── routes/                  # File-based routing views (Analytics, Holds, Settlements)
    │   ├── router.tsx               # App routing configuration
    │   ├── server.ts                # Frontend server configuration
    │   ├── start.ts                 # Application bootstrap script
    │   └── styles.css               # Tailwind CSS global stylesheet
    ├── supabase/                    # Database migrations and configuration
    ├── package.json                 # Node dependencies and scripts
    └── vite.config.ts               # Vite bundler configuration⚙️ Local Development Setup

Follow these steps to run the full-stack application locally on your machine.

1. Clone the Repository
Bash
git clone [https://github.com/shreyasmulekar/Razorpay-2.0.git](https://github.com/shreyasmulekar/Razorpay-2.0.git)
cd Razorpay-2.0
2. Start the Backend Server
Navigate to the backend directory:

Bash
cd Backend
Create and activate a virtual environment:

Bash
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate
Install dependencies:

Bash
pip install -r requirements.txt
Run the FastAPI development server:

Bash
uvicorn app.main:app --reload --port 8000
The backend API will be live at http://127.0.0.1:8000 (Swagger docs available at http://127.0.0.1:8000/docs).

3. Start the Frontend Dashboard
Open a new terminal window and navigate to the frontend directory:

Bash
cd Frontend
Install node dependencies:

Bash
npm install
Start the Vite development server:

Bash
npm run dev
The analytics dashboard will be live at http://localhost:8080.

💡 Key Features
True Success Rate Analytics: Differentiates between raw gateway reports and true ledger-backed transaction settlement.

Silent Timeout Capture: Automatically detects and logs network and gateway timeouts that slip past standard webhooks.

Live Database Binding: Real-time metrics recalculation directly driven by SQLite transaction states.
