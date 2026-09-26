# Cloud Shadow AI — Frontend

> **Intelligent Cloud Cost-Causality Observability Platform**  
> *"A cloud bill tells you WHAT you spent. Cloud Shadow AI tells you WHY you spent it."*

---

## 📌 Overview

Cloud Shadow AI is an enterprise-grade cloud cost-causality platform designed for FinOps, SRE, and Platform Engineering teams. It connects cloud billing deviations with real-time application behavior, microservice telemetry, and dependency relationships to uncover the root causes of unexpected cost increases.

### Core Workflow:
```
COST ➜ BEHAVIOUR ➜ DEPENDENCY ➜ ROOT CAUSE ➜ RECOMMENDATION
```

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Dark-first Cloud Observability Theme inspired by Datadog & AWS CloudWatch)
- **Visualization**: [Recharts](https://recharts.org/) (Cost trend areas, baseline comparisons, anomaly markers)
- **Interactive Graphs**: SVG/Canvas Causal & Dependency Topology with zoom, pan, hover, edge click, and node inspection
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: Node.js Test Runner with `tsx` for end-to-end data contract and API fallback validation

---

## 🧭 Application Routes

| Route | Description | Judge-Facing Focus |
|---|---|---|
| `/dashboard` | Primary executive & judge overview | 10-second answer: How much changed? What changed? Which service? Why? What to do? |
| `/costs` | Expenditure trajectory & breakdowns | Service, resource, and regional spend share (distinct from root cause) |
| `/services` | Microservices health inventory | Health status, hourly burn, traffic, latency, CPU, and active anomaly counts |
| `/services/[id]` | Deep service diagnostics | Explains *"Why is this service expensive?"* with telemetry history & dependencies |
| `/dependencies`| Interactive microservice topology | Real-time call relationships, throughput rates, latencies, and cost impact links |
| `/anomalies` | Statistical telemetry anomaly feed | Searchable, filterable, sortable anomaly table with detail inspector drawer |
| `/root-causes` | Corroborated incident episodes | Synthesized causal episodes with Evidence Scores and Cost Impacts |
| `/root-causes/[id]` | Deep root cause investigation | What changed?, Corroborating evidence, Causal graph, Timeline, and Remediations |
| `/recommendations` | Safer optimization opportunities | Prescribed architectural remediations with safety risk ratings (no fake claims) |

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Points to FastAPI backend (Sadaf's API)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Set to true to enforce demo mode, or false/empty for auto-detection
NEXT_PUBLIC_DEMO_MODE=false
```

### Mock / Demo Mode Architecture
- **Automatic Fallback**: If the FastAPI backend is offline or unreachable, the frontend automatically falls back to high-fidelity demo data conforming to the `EngineResult` schema.
- **Transparent Indicator**: A status badge in the top navigation bar displays `Live API` when connected or `Demo Mode` when running on fallback data.
- **Toggleable**: You can toggle demo mode on/off anytime from the sidebar or top bar to test live engine connectivity.

---

## 🛠️ Getting Started

### Prerequisites:
- **Node.js**: v18.17+ or v20+ (tested on v24.15.0)
- **npm**: v9+ (or pnpm / yarn)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build
```bash
npm run build
npm start
```

### 4. Run Lint & Tests
```bash
npm run lint
npm test
```

---

## 👥 Team Ownership & Integration Contract

- **Frontend**: Nikhil Kumar (You)
- **FastAPI Backend**: Sadaf
- **Data / Preprocessing**: Pushpa
- **ML / Analysis Engine**: Manish

### Expected Backend Endpoints:
```http
POST /analysis/run
GET  /dashboard/overview
GET  /costs
GET  /costs/trends?time_range={range}
GET  /services
GET  /services/{id}
GET  /dependencies
GET  /anomalies
GET  /root-causes
GET  /root-causes/{id}
GET  /recommendations
```

All responses conform directly to the TypeScript interfaces defined in [`src/types/index.ts`](./src/types/index.ts).
