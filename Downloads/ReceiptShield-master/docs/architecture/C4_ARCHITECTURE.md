# ReceiptShield C4 Architecture Model

This document captures the ReceiptShield architecture using the C4 model from context level down to a representative code-level view. It is intended to help engineers, operators, and stakeholders reason about the solution and its evolution.

---

## Level 1 – System Context

| Element | Description | Interactions |
| --- | --- | --- |
| **Employees** | Submit expense receipts and monitor processing results. | Use ReceiptShield Web App to upload receipts, view statuses, and respond to manager feedback. |
| **Managers** | Review, approve, or reject employee submissions. | Use ReceiptShield Web App to review flagged receipts and manage team performance. |
| **Finance Administrators** | Configure the system, manage invitations, and monitor fraud trends. | Use ReceiptShield Web App to send invitations, configure monitoring, and pull analytics. |
| **Invitation Recipients** | Prospective users invited by administrators. | Receive emails via SendGrid, accept invitations through the web app. |
| **ReceiptShield System** | Integrated AI-powered expense management platform. | Provides UI, APIs, automation, and data persistence. |
| **Firebase Platform** | Managed backend services (Auth, Firestore, Storage, App Hosting). | Authenticates users, persists documents/files, serves the app, enforces security rules. |
| **SendGrid** | Transactional email provider. | Sends invitation and notification emails from API routes. |
| **Google AI & Tesseract** | OCR and AI providers. | Process receipt images for structured data extraction. |
| **ML Ops Environment** | Python-based training artifacts and datasets. | Engineers retrain, evaluate, and publish ML models consumed by the app. |

---

## Level 2 – Container View

| Container | Technology | Responsibilities | Key Integrations |
| --- | --- | --- | --- |
| **Next.js Web Application** | Next.js App Router, React, Tailwind | Presents UI, orchestrates client-side workflows, invokes server actions and API routes. | Firebase Auth SDK, `/api/*` routes, analytics/monitoring hooks. |
| **Next.js API Layer** | Next.js Route Handlers (`src/app/api`) | Provides server-side capabilities: invitations, monitoring, ML proxy, OCR tests. | Firestore via service layer, SendGrid, ML service, monitoring tools. |
| **Firebase Authentication** | Firebase Auth | User identity management, session persistence, role lookup. | Accessed via `src/lib/firebase-auth.ts` from UI contexts. |
| **Firestore Database** | Firebase Firestore | Stores users, receipts, submissions, invitations, monitoring data. | Access via repositories (`src/lib/firebase-*-store.ts`). |
| **Firebase Storage** | Firebase Storage | Persists receipt images and artifacts. | Managed by `src/lib/firebase-storage.ts` when receipts are uploaded/deleted. |
| **App Hosting / CDN** | Firebase App Hosting + Vercel optional | Serves the web app, handles SSL, edge caching. | Deployment scripts under `scripts/deployment/*.sh`. |
| **SendGrid Email Service** | SendGrid API | Sends invitations and notifications. | Wrapped by `src/lib/sendgrid-service.ts` and `/api/send-invitation-email`. |
| **OCR / AI Services** | Google AI via Genkit, Tesseract.js | Extracts structured data from receipt images. | Orchestrated through `src/lib/hybrid-ocr-service.ts`. |
| **ML Fraud Detection Service** | Python (scikit-learn), JSON models | Scores receipts for fraud risk. Currently stubbed with placeholders pending deployment. | API endpoint `/api/ml-predict` and `ml/` utilities. |
| **Monitoring & Alerting** | Sentry (optional), custom scripts | Tracks health, logs, and metrics for production. | Setup via `scripts/setup/setup-monitoring.sh`; runtime utilities in `src/lib/monitoring*.ts`. |

---

## Level 3 – Component View (Next.js Application)

The most complex container is the Next.js application. It can be decomposed into the following components:

| Component | Responsibility | Implementation Highlights |
| --- | --- | --- |
| **UI Feature Shells** | Page-level experiences for different roles. | App router folders under `src/app` (e.g. employee/manager dashboards, invitation flows). |
| **Auth Context & Guards** | Manage user session, role-based routing, and guard access. | `src/contexts/auth-context.tsx` couples Firebase Auth events with router navigation. |
| **Domain Stores & Services** | Encapsulate Firestore access patterns for receipts, submissions, invitations, users, and monitoring. | Modules such as `src/lib/firebase-receipt-store.ts`, `src/lib/firebase-user-store.ts`, and `src/lib/firebase-invitation-store.ts`. |
| **OCR & AI Pipeline** | Convert uploaded images into structured receipt data with fallbacks and logging. | `src/lib/hybrid-ocr-service.ts`, `src/lib/tesseract-ocr-service.ts`, `src/lib/enhanced-ocr-service.ts`. |
| **Fraud Analysis Layer** | Combine ML scoring and AI reasoning for risk classification. | `src/lib/enhanced-fraud-service.ts`, `src/lib/ml-fraud-service.ts` (current stub). |
| **Email & Invitation Workflow** | Generate invitation templates, dispatch via SendGrid, and manage acceptance lifecycle. | `src/lib/email-service.ts`, `src/lib/sendgrid-service.ts`, API routes in `src/app/api/send-invitation*`. |
| **Monitoring & Alerting Utilities** | Capture app metrics, push health logs, and integrate with Sentry. | `src/lib/monitoring.ts`, `src/lib/alerting.ts`, `/api/monitoring/*` endpoints. |
| **Shared UI Library** | Design system primitives, dashboards, analytics components. | `src/components/ui` and role-specific component directories. |

Interactions flow from UI components to context hooks, into domain service modules that marshal data to Firebase, AI/OCR utilities, or external APIs, with results propagated back to the UI.

---

## Level 4 – Code-Level View (Receipt Ingestion & Fraud Analysis)

This sequence outlines how a receipt submitted by an employee is processed end-to-end.

1. **Upload & Submission Tracking**
   - UI trigger: Employee uploads via drag-and-drop components (`src/components/employee/...`).
   - Submission metadata stored through `saveSubmission` helpers in `src/lib/firebase-submission-store.ts`.
   - Image stored in Firebase Storage via `uploadReceiptImage` in `src/lib/firebase-storage.ts`.

2. **OCR Processing**
   - `performHybridOCRAnalysis` orchestrates OCR strategy selection, delegating to Tesseract or Google AI (`src/lib/hybrid-ocr-service.ts`).
   - Results persisted with `saveOCRAnalysis` (part of submission data service) to capture text, items, confidence.

3. **Fraud Evaluation**
   - AI heuristics computed by `analyzeReceiptForFraud` in `src/lib/enhanced-fraud-service.ts`.
   - ML prediction (stubbed today) retrieved via `getPredictionFromML` (`src/lib/ml-fraud-service.ts`) or proxied through `/api/ml-predict`.
   - Combined assessment aggregated into `FraudAnalysis` model (`src/types/index.ts`).

4. **Receipt Persistence & Workflow Routing**
   - Consolidated receipt saved through `addReceipt` in `src/lib/firebase-receipt-store.ts`, associating employee, supervisor, status, and fraud metadata.
   - Managers consume receipt queues through service functions like `getReceiptsBySupervisor` and review UI components.

5. **Notifications & Monitoring**
   - Alerts or invitation emails dispatched via `sendInvitationEmail` (`src/lib/sendgrid-service.ts`) when necessary.
   - Operational scripts (`scripts/testing/test-monitoring.sh`) and monitoring utilities (`src/lib/monitoring.ts`) track health metrics and anomalies.

---

## Architectural Considerations & Roadmap Notes

- **ML Service Hardening**: `/api/ml-predict` currently mocks fraud probability; integrate the Python model (`ml/train_model.py`) behind a secure endpoint or Cloud Function.
- **Genkit Re-Enablement**: `src/ai/genkit.ts` carries a placeholder to support deployment; restore when API keys are available.
- **Security & Compliance**: Review Firestore/Firebase Storage rules to ensure least privilege, especially around invitation acceptance and receipt images.
- **Scalability**: Firebase App Hosting fronts the Next.js app; monitor quotas (functions, Firestore reads) as volume grows.

This C4 model should be revised alongside significant architectural changes, new external integrations, or shifts in operational strategy.

---

## Related Architecture Documentation

For comprehensive architecture analysis and strategic planning, see:

- **[CTO Architecture Review](./CTO_ARCHITECTURE_REVIEW.md)** - Detailed technical assessment, security analysis, and recommendations
- **[Architecture Roadmap](./ARCHITECTURE_ROADMAP.md)** - 12-month strategic evolution plan with phases, milestones, and investments
- **[Executive Summary](./EXECUTIVE_SUMMARY.md)** - One-page summary for leadership decision-making
- **[UI/UX Component Prompts](./UI_UX_COMPONENT_PROMPTS.md)** - Component design patterns and guidelines

**Last Updated:** January 2025
