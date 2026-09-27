# ☁️ Cloud Shadow AI

### **From an unexplained cloud bill to an explainable cost story.**

> **A cloud bill tells you WHAT you spent. Cloud Shadow AI helps explain WHY you spent it.**

Cloud Shadow AI is an intelligent cloud cost investigation platform that connects **cloud spending, application behaviour, service dependencies, system events, and anomalies** to identify probable reasons behind unexpected cloud-cost changes.

Instead of simply reporting:

```text
Cloud Cost ↑ 38%
```

Cloud Shadow AI investigates the surrounding signals:

```text
Cost Increase
     ↓
Which service changed?
     ↓
Which metric became abnormal?
     ↓
What dependencies were affected?
     ↓
Did an event/deployment happen nearby?
     ↓
What evidence supports the explanation?
     ↓
What should the engineering team investigate?
```

The result is an **evidence-based cloud cost investigation workflow** rather than a simple billing dashboard.

---

## 🌐 Demo

| Component            | URL                                         |
| -------------------- | ------------------------------------------- |
| 🚀 Frontend          | https://cloud-shadow-seven.vercel.app/      |
| ⚙️ Backend API       | https://cloud-shadow-mdhh.onrender.com/     |
| 📚 API Documentation | https://cloud-shadow-mdhh.onrender.com/docs |

---

# 📑 Table of Contents

* [Problem](#-problem)
* [Solution](#-solution)
* [Key Features](#-key-features)
* [Architecture](#️-system-architecture)
* [Data Pipeline](#-data-pipeline)
* [AI/ML Analysis Engine](#-aiml-analysis-engine)
* [Anomaly Detection](#-anomaly-detection)
* [Cost Attribution](#-cost-attribution)
* [Root Cause Analysis](#-root-cause-analysis)
* [Evidence Scoring](#-evidence-scoring)
* [Dependency Analysis](#-dependency-aware-analysis)
* [Event Correlation](#-event-aware-analysis)
* [Recommendations](#-optimization-recommendations)
* [Backend](#-fastapi-backend)
* [Frontend](#-frontend)
* [API Reference](#-api-reference)
* [Dataset](#-dataset)
* [Project Structure](#-project-structure)
* [Technology Stack](#️-technology-stack)
* [Local Setup](#-local-development)
* [Deployment](#-production-deployment)
* [Testing & Evaluation](#-testing--evaluation)
* [Design Principles](#️-design-principles)
* [Limitations](#️-limitations)
* [Future Scope](#-future-scope)
* [Team](#-team)
* [Conclusion](#-conclusion)

---

# 🎯 Problem

## The Cloud Bill Nobody Can Explain

Modern cloud platforms provide extensive billing and monitoring information, but these signals are often distributed across different systems.

A development team may observe:

```text
Cloud Cost        ↑ 38%
Database Cost     ↑
Network Cost      ↑
Compute Cost      ↑
```

But the important question is:

> **Why did the cost increase?**

The answer may not exist in the billing data alone.

A possible chain could be:

```text
Deployment
     ↓
Application Traffic ↑
     ↓
API Requests ↑
     ↓
Database Queries ↑
     ↓
Database Load ↑
     ↓
Network Traffic ↑
     ↓
Cloud Cost ↑
```

Investigating this manually requires engineers to correlate:

* Billing information
* Application metrics
* Service dependencies
* Deployment events
* Historical behaviour
* Resource utilization

Cloud Shadow AI brings these signals into a unified investigation pipeline.

---

# 💡 Solution

Cloud Shadow AI transforms cloud telemetry into an **explainable cost investigation**.

The system combines:

```text
Cloud Costs
     +
Application Metrics
     +
Service Dependencies
     +
System Events
     +
Historical Behaviour
     ↓
Analysis Engine
     ↓
Anomalies
     ↓
Cost Attribution
     ↓
Root Cause Candidates
     ↓
Evidence Scoring
     ↓
Recommendations
```

The objective is to move from:

> **"The cloud bill increased."**

to:

> **"These services and system changes are associated with the observed cost increase, and the following explanation has the strongest supporting evidence."**

---

# 🚀 Key Features

### 🔹 Intelligent Anomaly Detection

Detects unusual changes in application and infrastructure metrics.

### 🔹 Historical Baseline

Compares current behaviour against historical expectations.

### 🔹 Cost Attribution

Identifies services/resources associated with the observed cost increase.

### 🔹 Dependency-Aware Investigation

Uses service relationships to understand possible propagation paths.

### 🔹 Event Correlation

Connects anomalies with deployments and other system events.

### 🔹 Root Cause Analysis

Combines multiple signals to rank probable explanations.

### 🔹 Evidence Scoring

Shows why one explanation has stronger supporting evidence than another.

### 🔹 Incident Episode Grouping

Groups related anomalies into a single investigation instead of treating every metric spike independently.

### 🔹 Optimization Recommendations

Provides context-aware suggestions with expected effects and potential risks.

### 🔹 Interactive Dashboard

Allows engineers to explore cost, anomalies, dependencies, root causes, and recommendations from one interface.

---

# 🏗️ System Architecture

```text
                           CLOUD SHADOW AI
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │      Data Sources       │
                    │                         │
                    │  Metrics                │
                    │  Costs                  │
                    │  Dependencies           │
                    │  Events                 │
                    │  Services               │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Data Processing Layer   │
                    │                         │
                    │ Cleaning                │
                    │ Validation              │
                    │ Normalization            │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Processed Dataset     │
                    └────────────┬────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │       CLOUD SHADOW ENGINE            │
              │                                     │
              │  Historical Baseline                │
              │          ↓                          │
              │  Anomaly Detection                  │
              │          ↓                          │
              │  Cost Attribution                   │
              │          ↓                          │
              │  Episode Grouping                   │
              │          ↓                          │
              │  Root Cause Analysis                │
              │          ↓                          │
              │  Evidence Scoring                   │
              │          ↓                          │
              │  Recommendations                    │
              └─────────────────┬───────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │      EngineResult       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       FastAPI           │
                    │        Backend          │
                    └────────────┬────────────┘
                                 │
                            REST / JSON
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       Next.js           │
                    │       Dashboard         │
                    └─────────────────────────┘
```

---

# 🔄 End-to-End Data Flow

```text
RAW CLOUD DATA
      │
      ▼
Data Cleaning & Validation
      │
      ▼
Processed Dataset
      │
      ├───────────────┐
      │               │
      ▼               ▼
Historical        Dependency
Baseline            Graph
      │               │
      └───────┬───────┘
              ▼
       Anomaly Detection
              │
              ▼
       Cost Attribution
              │
              ▼
      Incident Grouping
              │
              ▼
      Root Cause Analysis
              │
              ▼
       Evidence Scoring
              │
              ▼
       Recommendations
              │
              ▼
         EngineResult
              │
              ▼
          FastAPI
              │
              ▼
       Next.js Dashboard
```

---

# 📊 Data Pipeline

Cloud Shadow AI works with structured cloud infrastructure and application telemetry.

## Pipeline

```text
Raw Data
   ↓
Schema Validation
   ↓
Cleaning
   ↓
Normalization
   ↓
Processed Data
   ↓
Analysis Engine
```

Processed datasets are stored under:

```text
data/
└── processed/
    ├── metrics_clean.csv
    ├── costs_clean.csv
    ├── dependencies_clean.csv
    ├── events_clean.csv
    └── services.json
```

The preprocessing layer ensures that downstream analysis receives consistent and usable data.

---

# 📁 Dataset

## `metrics.csv`

Contains service-level application and infrastructure metrics.

Typical fields:

```text
timestamp
service_id
cpu
memory
requests
latency
errors
network_in
network_out
db_queries
```

These metrics help identify changes in service behaviour.

---

## `costs.csv`

Contains cloud resource cost information.

```text
timestamp
service_id
resource
region
usage
unit
cost
```

Cost data is used for service-level cost attribution and trend analysis.

---

## `dependencies.csv`

Represents communication or dependency relationships between services.

```text
source_service
target_service
request_count
```

Example:

```text
Order API
    │
    ▼
Database
```

---

## `events.csv`

Contains infrastructure and application events.

```text
timestamp
event_type
service_id
description
version
```

Examples include:

```text
Deployment
Configuration Change
Service Update
Infrastructure Event
```

---

## `services.json`

Contains service metadata used by the analysis and dashboard layers.

---

# 🤖 AI/ML Analysis Engine

The **Cloud Shadow Engine** is the intelligence layer of the platform.

Its job is not simply to detect expensive resources.

It attempts to establish a chain of supporting evidence:

```text
WHAT CHANGED?
      ↓
WHERE DID IT CHANGE?
      ↓
WHEN DID IT CHANGE?
      ↓
WHAT ELSE CHANGED?
      ↓
WHAT DEPENDS ON IT?
      ↓
WHAT COST IMPACT OCCURRED?
      ↓
WHAT EVENTS WERE NEARBY?
      ↓
WHICH EXPLANATION HAS THE STRONGEST EVIDENCE?
```

---

# 📈 Historical Baseline

Before detecting anomalies, the engine establishes expected historical behaviour.

Conceptually:

```text
Historical Observations
        ↓
Expected Behaviour
        ↓
Current Observation
        ↓
Deviation
        ↓
Potential Anomaly
```

This allows the system to distinguish between:

```text
Normal variation
        vs.
Unusual behaviour
```

The baseline becomes an important reference for both anomaly detection and evidence generation.

---

# 🚨 Anomaly Detection

The anomaly layer identifies unusual metric behaviour.

Signals include:

* CPU
* Memory
* Requests
* Latency
* Errors
* Network traffic
* Database queries
* Cost

An anomaly can contain:

```text
service_id
metric
baseline
current_value
change_percent
anomaly_score
severity
timestamp
```

Severity can be represented as:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

The system can therefore move from a raw metric:

```text
database_queries = 18,420
```

to an interpretable observation:

```text
Database queries
Baseline: 8,200
Current: 18,420
Change: +124.6%
Severity: HIGH
```

---

# 💰 Cost Attribution

Cost attribution determines which services or resources are associated with the observed financial change.

The system compares:

```text
Historical Cost
       ↓
Current Cost
       ↓
Cost Delta
       ↓
Service / Resource Contribution
```

This allows the engine to distinguish between:

```text
High activity
```

and:

```text
High activity
+
meaningful financial impact
```

The financial impact becomes an additional signal during root-cause analysis.

---

# 🔍 Root Cause Analysis

Root-cause analysis combines multiple evidence sources.

Instead of using:

```text
Highest metric = Root Cause
```

the engine considers:

```text
Anomaly Evidence
        +
Temporal Evidence
        +
Dependency Evidence
        +
Cost Evidence
        +
Event Evidence
        ↓
Root Cause Candidate
```

This produces a set of **probable explanations** rather than claiming absolute causal proof.

---

# 🧠 Evidence Scoring

Cloud Shadow AI combines several evidence dimensions.

| Evidence   | Weight |
| ---------- | -----: |
| Anomaly    |    30% |
| Temporal   |    20% |
| Dependency |    20% |
| Cost       |    20% |
| Event      |    10% |

Conceptually:

```text
Evidence Score =
    Anomaly Evidence
  + Temporal Evidence
  + Dependency Evidence
  + Cost Evidence
  + Event Evidence
```

The resulting score helps rank root-cause candidates within an investigation.

### Important distinction

The score is an **evidence strength indicator**, not a mathematical probability of causality.

For example:

```text
Candidate A → 0.84 evidence score
Candidate B → 0.51 evidence score
```

means Candidate A has stronger supporting evidence **within the available signals**.

It does not mean:

```text
Candidate A caused the incident with 84% probability.
```

---

# 🔗 Dependency-Aware Analysis

Cloud systems are interconnected.

A change in one service may affect multiple downstream services.

Example:

```text
             ┌──────────────┐
             │   Order API  │
             └──────┬───────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     ┌─────────┐         ┌─────────┐
     │Database │         │ Payment │
     └────┬────┘         └─────────┘
          │
          ▼
      DB Queries
```

Dependency relationships provide additional context when evaluating possible root causes.

If:

```text
Order API traffic ↑
        ↓
Database requests ↑
        ↓
Database load ↑
        ↓
Database cost ↑
```

the dependency chain becomes supporting evidence for the investigation.

---

# ⏱️ Event-Aware Analysis

Events provide temporal context.

Example:

```text
10:00
Deployment v2.1
   ↓
10:05
API Requests ↑
   ↓
10:07
Database Queries ↑
   ↓
10:10
Database Cost ↑
```

The engine can identify these temporal relationships and include them as evidence.

This helps answer:

> **What happened around the time the anomaly appeared?**

---

# 🧩 Incident / Episode Grouping

A real cloud incident may produce many simultaneous anomalies.

For example:

```text
Order API Requests ↑
Database Queries ↑
Database CPU ↑
Network Out ↑
Database Cost ↑
```

Treating these as five unrelated incidents would make investigation difficult.

Cloud Shadow groups related signals into an investigation episode:

```text
             INCIDENT
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
    Traffic   Database   Network
       │         │         │
       └─────────┼─────────┘
                 ▼
          Cost Increase
```

This produces a more coherent investigation story.

---

# 💡 Optimization Recommendations

After the analysis, Cloud Shadow generates investigation and optimization recommendations.

A recommendation can contain:

```text
service_id
action
reason
expected_effect
risk
```

Example:

```text
Action:
Investigate database query amplification.

Reason:
Database queries increased significantly above
the historical baseline following increased API traffic.

Expected Effect:
Potential reduction in database utilization
and associated cloud cost.

Risk:
Query optimization should be validated against
application correctness and latency.
```

Recommendations are therefore **context-aware**, rather than simply:

```text
"Reduce resources."
```

---

# 📦 EngineResult

The analysis engine produces a structured result.

```text
EngineResult
│
├── analysis_id
├── status
├── cost_summary
├── anomalies
├── root_causes
└── recommendations
```

### Root Cause Object

```text
service_id
evidence_score
estimated_cost_impact
evidence
anomaly_ids
dependencies
related_events
```

### Recommendation Object

```text
service_id
action
reason
expected_effect
risk
```

This structured contract allows the backend and frontend to remain independent of the engine's internal implementation.

---

# ⚙️ FastAPI Backend

The backend provides the API layer between the frontend and the analysis engine.

### Technologies

* Python
* FastAPI
* Pydantic
* Uvicorn

Architecture:

```text
Frontend
   ↓
REST API
   ↓
FastAPI
   ↓
Analysis Service
   ↓
Cloud Shadow Engine
   ↓
EngineResult
   ↓
JSON Response
```

The engine is integrated directly into the backend rather than deployed as a separate microservice.

This keeps the hackathon architecture lightweight and reduces unnecessary network communication.

---

# 📡 API Reference

## Health Check

```http
GET /health
```

Returns backend health status.

---

## Run Analysis

```http
POST /analysis/run
```

Runs the analysis pipeline.

Flow:

```text
Request
 ↓
Load Data
 ↓
Run Engine
 ↓
Generate EngineResult
 ↓
Return JSON
```

---

## Dashboard Overview

```http
GET /dashboard/overview
```

Returns dashboard-level information.

---

## Costs

```http
GET /costs
```

Returns cost information.

```http
GET /costs/trends
```

Returns cost trends over time.

---

## Services

```http
GET /services
```

Returns available services.

```http
GET /services/{id}
```

Returns information for a specific service.

---

## Dependencies

```http
GET /dependencies
```

Returns service dependency relationships.

---

## Anomalies

```http
GET /anomalies
```

Returns detected anomalies.

---

## Root Causes

```http
GET /root-causes
```

Returns probable root-cause candidates.

```http
GET /root-causes/{id}
```

Returns detailed root-cause information.

---

## Recommendations

```http
GET /recommendations
```

Returns generated optimization recommendations.

---

# 🎨 Frontend

The frontend is implemented using:

* Next.js
* React
* TypeScript
* Tailwind CSS

The dashboard consumes backend APIs and converts analysis results into an interactive investigation interface.

---

# 🖥️ Dashboard Modules

## 💰 Cloud Spend

Displays:

* Total spend
* Cost change
* Historical comparison
* Cost trends
* Affected services

---

## 🚨 Anomalies

Displays:

* Severity
* Service
* Metric
* Baseline
* Current value
* Percentage change
* Timestamp

---

## 🔍 Root Cause Investigation

Displays:

* Root-cause candidate
* Evidence score
* Estimated cost impact
* Supporting anomalies
* Related dependencies
* Related events

---

## 🔗 Dependency Graph

Visualizes:

```text
Service
  ↓
Dependency
  ↓
Anomaly
  ↓
Cost Impact
```

This helps users understand how changes may propagate through the architecture.

---

## 💡 Recommendations

Displays:

```text
What to investigate
        ↓
Why
        ↓
Expected effect
        ↓
Potential risk
```

---

# 📊 Example Investigation Story

A simplified investigation may look like:

```text
Cloud Cost
+38%
   │
   ▼
Order Service
Requests +72%
   │
   ▼
Database Queries
+121%
   │
   ▼
Database Load
+64%
   │
   ▼
Database Cost
+47%
```

The system then checks:

```text
Was there a deployment?
        ↓
Was the service dependency present?
        ↓
Did the timing align?
        ↓
Was the cost impact significant?
        ↓
Did historical behaviour confirm the anomaly?
```

The final result becomes an evidence-backed investigation rather than a single unexplained alert.

---

# 📁 Project Structure

```text
Cloud-Shadow/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analysis.py
│   │   │   ├── costs.py
│   │   │   ├── dependencies.py
│   │   │   ├── recommendations.py
│   │   │   ├── root_causes.py
│   │   │   └── services.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── engine/
│   ├── anomaly/
│   │   └── baseline.py
│   │
│   ├── attribution/
│   │   └── cost_attribution.py
│   │
│   ├── rootcause/
│   │   ├── analyzer.py
│   │   └── ...
│   │
│   ├── evidence.py
│   ├── analyzer.py
│   └── ...
│
├── data/
│   ├── raw/
│   │   ├── metrics.csv
│   │   ├── costs.csv
│   │   ├── dependencies.csv
│   │   └── events.csv
│   │
│   ├── processed/
│   │   ├── metrics_clean.csv
│   │   ├── costs_clean.csv
│   │   ├── dependencies_clean.csv
│   │   ├── events_clean.csv
│   │   └── services.json
│   │
│   ├── services.json
│   └── process_data.py
│
├── frontend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── test_engine_pipeline.py
├── test_rootcause_real.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

# 🛠️ Technology Stack

| Layer               | Technology                                    |
| ------------------- | --------------------------------------------- |
| Frontend            | Next.js, React, TypeScript                    |
| Styling             | Tailwind CSS                                  |
| Backend             | FastAPI, Python                               |
| Validation          | Pydantic                                      |
| Server              | Uvicorn                                       |
| Data Processing     | Pandas, NumPy                                 |
| Analysis Engine     | Python                                        |
| Anomaly Detection   | Baseline / Statistical Analysis               |
| Root Cause Analysis | Temporal + Dependency + Cost + Event Evidence |
| Data Format         | CSV, JSON                                     |
| Version Control     | Git, GitHub                                   |
| Frontend Deployment | Vercel                                        |
| Backend Deployment  | Render                                        |

---

# 💻 Local Development

## 1. Clone Repository

```bash
git clone https://github.com/manik-scode/Cloud-Shadow.git
cd Cloud-Shadow
```

---

# ⚙️ Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

Run the backend:

```powershell
uvicorn backend.app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

---

# 🎨 Frontend Setup

Open another terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start development server:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔐 Environment Variables

## Local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Production

```env
NEXT_PUBLIC_API_URL=https://cloud-shadow-mdhh.onrender.com
```

### Security

Do not commit:

```text
.env
.env.local
.env.production
API keys
private credentials
cloud secrets
```

to GitHub.

---

# 🌐 Production Deployment

## Frontend — Vercel

Production frontend:

```text
https://cloud-shadow-seven.vercel.app/
```

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://cloud-shadow-mdhh.onrender.com
```

---

## Backend — Render

Production backend:

```text
https://cloud-shadow-mdhh.onrender.com/
```

Start command:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

API documentation:

```text
https://cloud-shadow-mdhh.onrender.com/docs
```

---

# 🧪 Testing & Evaluation

Cloud Shadow AI is designed to be evaluated using measurable signals.

## Anomaly Detection

Potential evaluation metrics:

```text
Precision
Recall
F1 Score
False Positive Rate
```

---

## Root Cause Analysis

For known synthetic scenarios:

```text
Root Cause Identification Rate
Top-K Identification
Evidence Consistency
```

---

## Cost Attribution

Compare:

```text
Estimated Cost Contribution
            vs.
Known Scenario Cost Impact
```

---

## Recommendation Evaluation

Recommendations can be evaluated using:

```text
Potential Cost Reduction
Performance Impact
Reliability Risk
```

The evaluation framework is intended to use known scenarios and measurable outcomes rather than manually assigning success.

---

# 🛡️ Design Principles

## 1. Explainability

Every major root-cause candidate should have supporting evidence.

---

## 2. Evidence Over Guessing

Multiple signals are combined instead of relying on a single metric.

---

## 3. Dependency Awareness

Service relationships are incorporated into the investigation.

---

## 4. Historical Context

Current behaviour is compared against historical behaviour.

---

## 5. Risk Awareness

Recommendations consider possible effects on:

* Cost
* Performance
* Reliability
* Availability

---

## 6. No False Causality Claims

Cloud Shadow AI does not claim that correlation alone proves causation.

It reports:

> **probable explanations supported by available evidence.**

---

## 7. Modular Architecture

The system separates:

```text
Data
 ↓
Engine
 ↓
Backend
 ↓
Frontend
```

This allows each layer to evolve independently.

---

# ⚠️ Limitations

Cloud Shadow AI is an **evidence-based investigation assistant**, not a guaranteed causal inference system.

Real distributed cloud environments can contain:

* Hidden dependencies
* Missing telemetry
* Simultaneous changes
* Delayed effects
* Confounding variables
* Incomplete event logs
* Shared infrastructure

Therefore:

```text
Evidence Score
      ≠
Causal Probability
```

The platform helps engineers narrow down and investigate probable explanations.

Final production decisions should still be validated by the engineering team.

---

# 🚀 Future Scope

## ☁️ Real Cloud Integrations

Future versions can integrate directly with:

```text
AWS
Azure
Google Cloud
```

for live billing and telemetry.

---

## 🤖 LLM-Powered Explanations

A future LLM layer could convert structured engine output into natural-language incident reports.

Example:

```text
"Database cost increased primarily during the
period following increased Order API traffic.
The strongest supporting signals are increased
database queries, dependency correlation, and
a nearby deployment event."
```

---

## 📡 Real-Time Monitoring

Move from batch analysis to:

```text
Streaming Metrics
       ↓
Real-Time Detection
       ↓
Incident Creation
       ↓
Live Investigation
```

---

## 📈 Cost Forecasting

Predict future cloud spending using historical cost patterns.

---

## 🌎 Multi-Cloud Analysis

Provide unified analysis across:

```text
AWS + Azure + GCP
```

---

## 🔔 Incident Notifications

Future integrations could include:

```text
Slack
Microsoft Teams
Email
PagerDuty
```

---

## 🧠 Historical Incident Learning

Past incidents can be used to improve future investigation and recommendation quality.

---

## 🔬 Advanced Causal Inference

Future versions could incorporate stronger causal inference methods rather than relying primarily on temporal and dependency evidence.

---

# 🏆 Hackathon Context

## Bit N Build '26

### Problem

**The Cloud Bill Nobody Can Explain**

### Project

**Cloud Shadow AI**

### Core Concept

Cloud Shadow AI connects cloud spending with:

```text
Application Behaviour
        +
Service Dependencies
        +
System Events
        +
Historical Behaviour
        +
Anomalies
```

to produce:

```text
Probable Root Causes
        +
Supporting Evidence
        +
Cost Impact
        +
Optimization Recommendations
```

---

# 👥 Team

## Cloud Shadow AI

| Member      | Role                  | Primary Responsibilities                                                                                     |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Manish**  | **AI/ML Engineer**    | Analysis Engine, Anomaly Detection, Cost Attribution, Root Cause Analysis, Evidence Scoring, Recommendations |
| **Sadaf**   | **Backend Engineer**  | FastAPI, REST APIs, Engine Integration, Backend Deployment                                                   |
| **Aaditya** | **Frontend Engineer** | Next.js, Dashboard, UI/UX, Visualizations, Frontend Deployment                                               |
| **Pushpa**  | **Data Engineer**     | Dataset Generation, Data Processing, Validation, Metrics, Dependencies, Events                               |

---
## 📊 Pushpa — Data Engineer

Responsible for:

* Synthetic cloud dataset
* Data generation
* Data cleaning
* Data validation
* Processed datasets
* Metrics preparation
* Service dependency data
* Event data
* Dataset consistency

---
## 👨‍💻 Manish — AI/ML Engineer

Responsible for the intelligence layer:

```text
Historical Baseline
       ↓
Anomaly Detection
       ↓
Cost Attribution
       ↓
Incident Grouping
       ↓
Root Cause Analysis
       ↓
Evidence Scoring
       ↓
Recommendations
       ↓
EngineResult
```

Primary focus:

* Analysis engine
* Root-cause intelligence
* Evidence framework
* Cost-impact analysis
* Recommendation logic
* Engine integration

---


## ⚙️ Sadaf — Backend Engineer

Responsible for:

* FastAPI backend
* REST APIs
* Request/response schemas
* Engine integration
* Backend architecture
* API documentation
* Frontend-backend communication
* Production backend deployment

---

## 🎨 Aaditya — Frontend Engineer

Responsible for:

* Next.js application
* Dashboard architecture
* UI components
* Cost visualizations
* Anomaly visualization
* Root-cause interface
* Dependency visualization
* Recommendation interface
* Production frontend deployment

---


# 🔐 Engineering Responsibility

The architecture intentionally separates responsibilities:

```text
Pushpa
  │
  │ Data
  ▼
Manish
  │
  │ EngineResult
  ▼
Sadaf
  │
  │ REST API
  ▼
Aaditya
  │
  │ Dashboard
  ▼
End User
```

This separation allows each team member to work independently while maintaining a clear integration contract.

---

# 🌟 Why Cloud Shadow AI?

Traditional cloud cost dashboards answer:

```text
WHAT COST MORE?
```

Cloud Shadow AI focuses on:

```text
WHAT CHANGED?
        ↓
WHERE?
        ↓
WHEN?
        ↓
WHAT WAS AFFECTED?
        ↓
WHAT EVENTS WERE RELATED?
        ↓
WHAT COST IMPACT OCCURRED?
        ↓
WHAT EXPLANATION HAS THE STRONGEST EVIDENCE?
        ↓
WHAT SHOULD WE INVESTIGATE?
```

That is the core idea behind Cloud Shadow AI.

---

# 📌 Final Architecture

```text
                 ┌─────────────────────┐
                 │      CLOUD DATA     │
                 │                     │
                 │ Metrics             │
                 │ Costs               │
                 │ Dependencies        │
                 │ Events              │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   DATA PIPELINE     │
                 │                     │
                 │ Clean               │
                 │ Validate            │
                 │ Normalize           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  CLOUD SHADOW       │
                 │      ENGINE         │
                 │                     │
                 │ Baseline            │
                 │ Anomaly Detection   │
                 │ Attribution         │
                 │ Root Cause          │
                 │ Evidence            │
                 │ Recommendations     │
                 └──────────┬──────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ EngineResult │
                    └───────┬──────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │       FASTAPI       │
                 │       BACKEND       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │       NEXT.JS       │
                 │      DASHBOARD      │
                 └──────────┬──────────┘
                            │
                            ▼
                    👨‍💻 ENGINEER
```

---

# ☁️ Cloud Shadow AI

### **From an unexplained cloud bill to an explainable cost story.**

**Cloud costs tell you what happened.
Cloud Shadow AI helps investigate why.**
