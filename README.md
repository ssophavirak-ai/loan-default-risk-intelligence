# Loan Default Risk Intelligence

[![R](https://img.shields.io/badge/R-4.3.3-276DC3?logo=r)](https://www.r-project.org/) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tests](https://img.shields.io/badge/tests-4%20passing-18B6A4)](#validation)

**Loan Default Risk Intelligence** is a full-stack data analytics and visualization project that converts a reproducible R classification workflow into a review-oriented credit-risk dashboard. The project demonstrates the full analytical lifecycle: source validation, preprocessing, exploratory analysis, model comparison, cost-aware evaluation, explainability, interactive scoring, documentation, and testing.

> This repository is a historical benchmark demonstration. It must not be used as a stand-alone system to approve, decline, price, or otherwise materially affect a real person’s access to credit.

## Table of contents

- [Project objective](#project-objective)
- [Key results](#key-results)
- [Application features](#application-features)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [File-by-file reference](#file-by-file-reference)
- [Getting started](#getting-started)
- [Analysis workflow](#analysis-workflow)
- [API procedures](#api-procedures)
- [Validation](#validation)
- [Responsible use and limitations](#responsible-use-and-limitations)
- [Project documentation](#project-documentation)
- [Data provenance](#data-provenance)

## Project objective

The analytical question is: **given an applicant’s financial profile and loan characteristics, how can a classification model estimate bad-risk probability well enough to prioritize analyst attention while keeping the final decision human-reviewed?**

The analysis uses the UCI Statlog German Credit dataset, which contains 1,000 historical applications, 20 predictors, and a binary Good/Bad outcome. The dataset includes an asymmetric cost matrix where a bad-risk applicant incorrectly classified as good carries five times the cost of the opposite error.[1]

## Key results

| Metric | Result |
|---|---:|
| Applications | 1,000 |
| Predictors | 20 |
| Good outcomes | 700 |
| Bad outcomes | 300 |
| Bad-risk share | 30.0% |
| Training/test split | 750 / 250, stratified |
| Champion model | Random Forest |
| Champion AUC | 0.8085 |
| Champion accuracy | 76.8% |
| Champion weighted cost | 226 |
| Review threshold | 0.50 |

### Model comparison

| Model | Accuracy | Precision | Recall | Specificity | F1 | AUC | Weighted cost |
|---|---:|---:|---:|---:|---:|---:|---:|
| Logistic regression | 73.2% | 56.5% | 46.7% | 84.6% | 51.1% | 0.7673 | 227 |
| Decision tree | 72.4% | 55.4% | 41.3% | 85.7% | 47.3% | 0.6830 | 245 |
| Random Forest | **76.8%** | **67.4%** | 44.0% | **90.9%** | **53.2%** | **0.8085** | **226** |

Random Forest is selected as the dashboard champion because it provides the strongest ranking quality, the highest accuracy, and the lowest observed weighted cost in the generated test artifact. The dashboard exposes the metrics rather than hiding the trade-offs behind a single score.

## Application features

### Analytics dashboard

The dashboard provides an overview of portfolio volume, observed bad-risk rate, held-out test size, and review threshold. It also presents the champion model and the purpose of the product as decision support.

### Model lab

The model lab compares logistic regression, decision tree, and Random Forest using AUC and the documented asymmetric error cost. This creates a direct connection between the analytical output and the operational selection.

### Explainability

The explainability panel displays Random Forest feature importance and the observed risk-rate difference by checking-account status. The interface distinguishes association from causation and communicates that the output is a triage signal.

### Interactive application scorer

The application scorer accepts amount, duration, age, checking status, savings buffer, employment tenure, and housing. It returns a probability, risk band, review decision, threshold, and driver explanations. High-risk cases are routed to human review rather than automatically declined.

### Monitoring sample

The monitoring table shows held-out applications sorted by predicted risk, including amount, duration, checking segment, predicted probability, model decision, and observed outcome.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Statistical analysis | R 4.3.3 | Data preparation, EDA, model fitting, evaluation, artifacts |
| Frontend | React 19 + TypeScript | Dashboard and interactive scoring experience |
| Styling | Tailwind CSS 4 + custom CSS tokens | Responsive visual system |
| Charts | Recharts | Model, segment, and importance visualizations |
| Backend | Express 4 + tRPC 11 | Typed API procedures |
| Database scaffold | Drizzle ORM + MySQL/TiDB support | User/session-ready application foundation |
| Testing | Vitest | API and authentication tests |
| Build | Vite + esbuild | Frontend and server production builds |

## Repository structure

```text
analysis/                 Reproducible R analysis and generated artifacts
  data/                   Original UCI data and documentation
  figures/                R-generated PNG visualizations
  output/                 CSV, JSON, and serialized R model outputs
  run_analysis.R          End-to-end analysis script
client/                   React application
  src/pages/Home.tsx      Main dashboard and scorer
  src/index.css           Dashboard visual system
server/                   Express/tRPC backend
  routers.ts              Summary and prediction procedures
  risk.test.ts            Risk API tests
docs/                     Portfolio report and two-minute demo script
drizzle/                  Database schema and migration metadata
shared/                   Shared types, constants, and errors
```

## File-by-file reference

The following inventory describes every tracked project file included in the source archive, excluding installed dependencies, build output, Git metadata, and internal WebDev checkpoint metadata.

| File | Description |
|---|---|
| `.gitignore` | Git exclusions for dependencies, build output, local environment files, and runtime artifacts. |
| `.gitkeep` | Placeholder file preserving an otherwise empty tracked directory. |
| `.manus-logs/browserConsole.log` | Local development log generated by the WebDev runtime. |
| `.manus-logs/devserver.log` | Local development log generated by the WebDev runtime. |
| `.manus-logs/networkRequests.log` | Local development log generated by the WebDev runtime. |
| `.manus-logs/sessionReplay.log` | Local development log generated by the WebDev runtime. |
| `.prettierignore` | Prettier exclusions. |
| `.prettierrc` | Prettier formatting configuration. |
| `.project-config.json` | WebDev project metadata and runtime configuration. |
| `README.md` | Primary repository documentation, setup instructions, analytical results, responsible-use guidance, and this file-by-file inventory. |
| `analysis/data/german.data` | Original space-delimited UCI Statlog German Credit dataset used by the R pipeline. |
| `analysis/data/german.doc` | Original UCI documentation containing attribute definitions and the asymmetric error-cost matrix. |
| `analysis/figures/class_distribution.png` | R-generated chart showing the Good versus Bad outcome mix. |
| `analysis/figures/model_cost_comparison.png` | R-generated chart comparing weighted classification cost across models. |
| `analysis/figures/risk_by_checking.png` | R-generated chart comparing bad-risk rates by checking-account status. |
| `analysis/output/class_distribution.csv` | Class counts and shares exported from the EDA stage. |
| `analysis/output/class_distribution.json` | JSON class distribution used by downstream consumers. |
| `analysis/output/decision_tree.rds` | Serialized R decision-tree model artifact. |
| `analysis/output/feature_importance.csv` | Random Forest mean-decrease accuracy and mean-decrease Gini importance values. |
| `analysis/output/feature_importance.json` | JSON feature-importance summary used by the dashboard. |
| `analysis/output/findings.json` | Computed narrative findings, champion model, bad-risk rate, dataset partitions, and decision-use note. |
| `analysis/output/logistic_coefficients.csv` | Logistic-regression coefficient estimates, directions, and magnitudes. |
| `analysis/output/logistic_model.rds` | Serialized R logistic-regression model artifact. |
| `analysis/output/model_metrics.csv` | Tabular held-out metrics for all fitted models. |
| `analysis/output/model_metrics.json` | JSON version of the model comparison metrics for application and reporting use. |
| `analysis/output/numeric_summary.csv` | Descriptive statistics for the numeric predictors. |
| `analysis/output/preprocessing.json` | Audit metadata for row counts, missing values, duplicates, feature types, seed, and split strategy. |
| `analysis/output/random_forest.rds` | Serialized R Random Forest model artifact. |
| `analysis/output/risk_by_checking.csv` | Bad-risk rates grouped by checking-account category. |
| `analysis/output/risk_by_checking.json` | JSON risk-segment summary used for dashboard visualizations. |
| `analysis/output/sample_applications.csv` | Scored held-out applications for monitoring-table analysis. |
| `analysis/output/sample_applications.json` | JSON sample applications used in the dashboard monitoring view. |
| `analysis/run_analysis.R` | End-to-end R pipeline for data loading, preprocessing, EDA, stratified splitting, logistic regression, decision tree, Random Forest, evaluation, model artifacts, JSON/CSV exports, and figures. |
| `client/index.html` | HTML entry document, metadata, fonts, theme color, and Vite application mount point. |
| `client/public/.gitkeep` | Project support file used by the application build or development workflow. |
| `client/public/__manus__/debug-collector.js` | Runtime support asset used by the WebDev development environment. |
| `client/public/__manus__/version.json` | Runtime support asset used by the WebDev development environment. |
| `client/src/App.tsx` | Application shell, theme provider, toast provider, and route registration. |
| `client/src/_core/hooks/useAuth.ts` | Authentication hook for current-user state, login, logout, and loading/error handling. |
| `client/src/components/AIChatBox.tsx` | Reusable chat interface component supplied by the scaffold for future conversational features. |
| `client/src/components/DashboardLayout.tsx` | Reusable scaffold dashboard layout with navigation and authentication-aware structure. |
| `client/src/components/DashboardLayoutSkeleton.tsx` | Loading skeleton for dashboard-layout initialization. |
| `client/src/components/ErrorBoundary.tsx` | React error boundary for rendering a controlled fallback on runtime errors. |
| `client/src/components/ManusDialog.tsx` | Reusable dialog integration component supplied by the scaffold. |
| `client/src/components/Map.tsx` | Reusable map integration component supplied by the scaffold. |
| `client/src/components/ui/accordion.tsx` | Reusable shadcn/ui accordion component used for accessible interface primitives. |
| `client/src/components/ui/alert-dialog.tsx` | Reusable shadcn/ui alert-dialog component used for accessible interface primitives. |
| `client/src/components/ui/alert.tsx` | Reusable shadcn/ui alert component used for accessible interface primitives. |
| `client/src/components/ui/aspect-ratio.tsx` | Reusable shadcn/ui aspect-ratio component used for accessible interface primitives. |
| `client/src/components/ui/avatar.tsx` | Reusable shadcn/ui avatar component used for accessible interface primitives. |
| `client/src/components/ui/badge.tsx` | Reusable shadcn/ui badge component used for accessible interface primitives. |
| `client/src/components/ui/breadcrumb.tsx` | Project support file used by the application build or development workflow. |
| `client/src/components/ui/button-group.tsx` | Reusable shadcn/ui button-group component used for accessible interface primitives. |
| `client/src/components/ui/button.tsx` | Reusable shadcn/ui button component used for accessible interface primitives. |
| `client/src/components/ui/calendar.tsx` | Reusable shadcn/ui calendar component used for accessible interface primitives. |
| `client/src/components/ui/card.tsx` | Reusable shadcn/ui card component used for accessible interface primitives. |
| `client/src/components/ui/carousel.tsx` | Reusable shadcn/ui carousel component used for accessible interface primitives. |
| `client/src/components/ui/chart.tsx` | Reusable shadcn/ui chart component used for accessible interface primitives. |
| `client/src/components/ui/checkbox.tsx` | Reusable shadcn/ui checkbox component used for accessible interface primitives. |
| `client/src/components/ui/collapsible.tsx` | Reusable shadcn/ui collapsible component used for accessible interface primitives. |
| `client/src/components/ui/command.tsx` | Reusable shadcn/ui command component used for accessible interface primitives. |
| `client/src/components/ui/context-menu.tsx` | Reusable shadcn/ui context-menu component used for accessible interface primitives. |
| `client/src/components/ui/dialog.tsx` | Reusable shadcn/ui dialog component used for accessible interface primitives. |
| `client/src/components/ui/drawer.tsx` | Reusable shadcn/ui drawer component used for accessible interface primitives. |
| `client/src/components/ui/dropdown-menu.tsx` | Reusable shadcn/ui dropdown-menu component used for accessible interface primitives. |
| `client/src/components/ui/empty.tsx` | Reusable shadcn/ui empty component used for accessible interface primitives. |
| `client/src/components/ui/field.tsx` | Reusable shadcn/ui field component used for accessible interface primitives. |
| `client/src/components/ui/form.tsx` | Reusable shadcn/ui form component used for accessible interface primitives. |
| `client/src/components/ui/hover-card.tsx` | Reusable shadcn/ui hover-card component used for accessible interface primitives. |
| `client/src/components/ui/input-group.tsx` | Reusable shadcn/ui input-group component used for accessible interface primitives. |
| `client/src/components/ui/input-otp.tsx` | Reusable shadcn/ui input-otp component used for accessible interface primitives. |
| `client/src/components/ui/input.tsx` | Reusable shadcn/ui input component used for accessible interface primitives. |
| `client/src/components/ui/item.tsx` | Reusable shadcn/ui item component used for accessible interface primitives. |
| `client/src/components/ui/kbd.tsx` | Reusable shadcn/ui kbd component used for accessible interface primitives. |
| `client/src/components/ui/label.tsx` | Reusable shadcn/ui label component used for accessible interface primitives. |
| `client/src/components/ui/menubar.tsx` | Reusable shadcn/ui menubar component used for accessible interface primitives. |
| `client/src/components/ui/navigation-menu.tsx` | Reusable shadcn/ui navigation-menu component used for accessible interface primitives. |
| `client/src/components/ui/pagination.tsx` | Reusable shadcn/ui pagination component used for accessible interface primitives. |
| `client/src/components/ui/popover.tsx` | Reusable shadcn/ui popover component used for accessible interface primitives. |
| `client/src/components/ui/progress.tsx` | Reusable shadcn/ui progress component used for accessible interface primitives. |
| `client/src/components/ui/radio-group.tsx` | Reusable shadcn/ui radio-group component used for accessible interface primitives. |
| `client/src/components/ui/resizable.tsx` | Reusable shadcn/ui resizable component used for accessible interface primitives. |
| `client/src/components/ui/scroll-area.tsx` | Reusable shadcn/ui scroll-area component used for accessible interface primitives. |
| `client/src/components/ui/select.tsx` | Reusable shadcn/ui select component used for accessible interface primitives. |
| `client/src/components/ui/separator.tsx` | Reusable shadcn/ui separator component used for accessible interface primitives. |
| `client/src/components/ui/sheet.tsx` | Reusable shadcn/ui sheet component used for accessible interface primitives. |
| `client/src/components/ui/sidebar.tsx` | Reusable shadcn/ui sidebar component used for accessible interface primitives. |
| `client/src/components/ui/skeleton.tsx` | Reusable shadcn/ui skeleton component used for accessible interface primitives. |
| `client/src/components/ui/slider.tsx` | Reusable shadcn/ui slider component used for accessible interface primitives. |
| `client/src/components/ui/sonner.tsx` | Reusable shadcn/ui sonner component used for accessible interface primitives. |
| `client/src/components/ui/spinner.tsx` | Reusable shadcn/ui spinner component used for accessible interface primitives. |
| `client/src/components/ui/switch.tsx` | Reusable shadcn/ui switch component used for accessible interface primitives. |
| `client/src/components/ui/table.tsx` | Reusable shadcn/ui table component used for accessible interface primitives. |
| `client/src/components/ui/tabs.tsx` | Reusable shadcn/ui tabs component used for accessible interface primitives. |
| `client/src/components/ui/textarea.tsx` | Reusable shadcn/ui textarea component used for accessible interface primitives. |
| `client/src/components/ui/toggle-group.tsx` | Reusable shadcn/ui toggle-group component used for accessible interface primitives. |
| `client/src/components/ui/toggle.tsx` | Reusable shadcn/ui toggle component used for accessible interface primitives. |
| `client/src/components/ui/tooltip.tsx` | Reusable shadcn/ui tooltip component used for accessible interface primitives. |
| `client/src/const.ts` | Frontend constants and login/navigation helpers used by the scaffold. |
| `client/src/contexts/ThemeContext.tsx` | Theme context and light/dark theme state management. |
| `client/src/hooks/useComposition.ts` | Reusable frontend hook for responsive behavior and stable React interactions. |
| `client/src/hooks/useMobile.tsx` | Reusable frontend hook for responsive behavior and stable React interactions. |
| `client/src/hooks/usePersistFn.ts` | Reusable frontend hook for responsive behavior and stable React interactions. |
| `client/src/index.css` | Global design tokens, responsive layout, sidebar, cards, charts, tables, forms, and dashboard styling. |
| `client/src/lib/trpc.ts` | Typed React tRPC client binding generated from the server AppRouter contract. |
| `client/src/lib/utils.ts` | Shared frontend utility helpers, including class-name composition. |
| `client/src/main.tsx` | React bootstrap file configuring QueryClient, tRPC client, authentication error handling, and application rendering. |
| `client/src/pages/ComponentShowcase.tsx` | Internal component showcase page supplied by the application scaffold. |
| `client/src/pages/Home.tsx` | Main risk-intelligence dashboard containing KPI cards, model lab, explainability, application scorer, monitoring table, and methodology sections. |
| `client/src/pages/NotFound.tsx` | Fallback page for unknown routes. |
| `components.json` | shadcn/ui component configuration. |
| `docs/PROJECT_REPORT.md` | Formal portfolio report covering business question, dataset, methodology, model comparison, results, implementation, reproducibility, limitations, and references. |
| `docs/VIDEO_SCRIPT.md` | Two-minute project demonstration narration covering the analytical story and dashboard walkthrough. |
| `drizzle.config.ts` | Drizzle Kit database migration configuration. |
| `drizzle/0000_chemical_speed_demon.sql` | Initial generated database migration. |
| `drizzle/meta/0000_snapshot.json` | Drizzle schema snapshot associated with the initial migration. |
| `drizzle/meta/_journal.json` | Drizzle migration journal. |
| `drizzle/migrations/.gitkeep` | Placeholder preserving the migrations directory in version control. |
| `drizzle/relations.ts` | Drizzle relation definitions for the database schema. |
| `drizzle/schema.ts` | Drizzle database schema, including the scaffold user table and generated types. |
| `package.json` | Project scripts, runtime dependencies, development dependencies, and package metadata. |
| `patches/wouter@3.7.1.patch` | Compatibility patch for the pinned Wouter routing dependency. |
| `pnpm-lock.yaml` | Locked dependency graph for reproducible pnpm installations. |
| `server/_core/context.ts` | tRPC request context creation, including request, response, and authenticated user state. |
| `server/_core/cookies.ts` | Session cookie names and secure cookie configuration helpers. |
| `server/_core/dataApi.ts` | Data API integration helper supplied by the scaffold. |
| `server/_core/env.ts` | Typed access to supported runtime environment variables. |
| `server/_core/heartbeat.ts` | Server heartbeat and runtime liveness support. |
| `server/_core/imageGeneration.ts` | Image-generation integration helper supplied by the scaffold. |
| `server/_core/index.ts` | Express server entrypoint and WebDev/Vite integration bootstrap. |
| `server/_core/llm.ts` | LLM integration helper supplied by the scaffold. |
| `server/_core/map.ts` | Map integration helper supplied by the scaffold. |
| `server/_core/notification.ts` | Notification integration helper supplied by the scaffold. |
| `server/_core/oauth.ts` | OAuth callback and session integration supplied by the scaffold. |
| `server/_core/sdk.ts` | Server-side Manus SDK integration helpers. |
| `server/_core/storageProxy.ts` | Storage proxy integration helper supplied by the scaffold. |
| `server/_core/systemRouter.ts` | System-level tRPC procedures provided by the application scaffold. |
| `server/_core/trpc.ts` | tRPC router, procedure, authentication, and middleware primitives. |
| `server/_core/types/cookie.d.ts` | Type declarations for cookie/session behavior. |
| `server/_core/types/manusTypes.ts` | Type declarations for Manus runtime integrations. |
| `server/_core/vite.ts` | Vite development-server middleware and static asset integration. |
| `server/_core/voiceTranscription.ts` | Voice-transcription integration helper supplied by the scaffold. |
| `server/auth.logout.test.ts` | Unit test verifying session-cookie clearing on logout. |
| `server/db.ts` | Database connection helper and user upsert/query functions for the full-stack scaffold. |
| `server/risk.test.ts` | Unit tests for risk summary output and high/low exposure prediction behavior. |
| `server/routers.ts` | Typed public risk API: summary metadata, model metrics, feature importance, sample applications, and interactive application scoring. |
| `server/storage.ts` | Storage helper entry point for application file storage. |
| `shared/_core/errors.ts` | Shared type or constant used across frontend and backend boundaries. |
| `shared/const.ts` | Shared type or constant used across frontend and backend boundaries. |
| `shared/types.ts` | Shared type or constant used across frontend and backend boundaries. |
| `template.json` | WebDev template metadata. |
| `tsconfig.json` | TypeScript compiler configuration, strictness settings, path aliases, and included source directories. |
| `vite.config.ts` | Vite build and development configuration. |
| `vite.config.ts.bak` | Backup copy of the Vite configuration created by the project scaffold. |
| `vitest.config.ts` | Vitest test-runner configuration. |

## Getting started

### Prerequisites

Install Node.js 22 or later, pnpm, and R 4.3 or later. The R packages used by the analysis include `dplyr`, `tidyr`, `ggplot2`, `randomForest`, `rpart`, and `jsonlite`.

### Install frontend and backend dependencies

```bash
pnpm install
```

### Run the R analysis

```bash
Rscript analysis/run_analysis.R
```

The script reads `analysis/data/german.data` and writes reproducible outputs to `analysis/output/` and PNG figures to `analysis/figures/`.

### Run the web application

```bash
pnpm dev
```

The development server starts the React frontend and Express/tRPC backend together.

### Run the production build

```bash
pnpm build
pnpm start
```

## Analysis workflow

1. Read the original UCI space-delimited dataset.
2. Assign documented feature names and convert categorical predictors to factors.
3. Verify missing values and duplicate rows.
4. Encode `Good` and `Bad` target classes.
5. Perform a fixed-seed stratified 75/25 train/test split.
6. Fit logistic regression, decision tree, and Random Forest models.
7. Evaluate accuracy, precision, recall, specificity, F1, AUC, and weighted error cost.
8. Export model artifacts, feature importance, coefficients, summaries, sample predictions, and findings.
9. Serve the computed results and an interactive review-oriented scorer through typed tRPC procedures.

## API procedures

### `risk.summary`

Returns dataset KPIs, champion-model metadata, model comparison metrics, feature importance, checking-account risk segments, monitoring sample rows, methodology steps, and analysis-run metadata.

### `risk.predict`

Accepts the following validated input fields:

| Field | Type |
|---|---|
| `amount` | Number from 100 to 100,000 |
| `duration` | Number from 1 to 120 months |
| `age` | Number from 18 to 100 years |
| `checking` | `below_zero`, `zero_to_two_hundred`, `two_hundred_plus`, or `none` |
| `savings` | `low`, `medium`, `high`, or `unknown` |
| `employment` | `unemployed`, `under_one`, `one_to_four`, `four_to_seven`, or `seven_plus` |
| `housing` | `rent`, `own`, or `free` |

The procedure returns a risk probability, decision, band, driver explanations, model label, and threshold.

## Validation

Run the complete validation sequence before submitting changes: 

```bash
pnpm check
pnpm build
pnpm test
```

The current repository has four passing Vitest tests: one authentication logout test and three risk API tests covering summary output, high-exposure review routing, and lower-exposure routing.

## Responsible use and limitations

The dataset is historical, small, and not representative of a current lending population. The target label reflects a prior benchmark context rather than a universal definition of default. Some predictors may be sensitive or proxy-like and would require governance before any real-world use. The TypeScript scorer is a product demonstration of the selected feature logic; a production system should validate and serve the serialized R model through a controlled model-serving layer.

A production implementation would require out-of-time validation, calibration analysis, population-stability monitoring, fairness assessment, adverse-action reason governance, access controls, audit logs, threshold approval, drift monitoring, and formal model risk management.

## Project documentation

- [`docs/PROJECT_REPORT.md`](docs/PROJECT_REPORT.md) contains the formal analytical report.
- [`docs/VIDEO_SCRIPT.md`](docs/VIDEO_SCRIPT.md) contains the two-minute project demonstration narration.
- [`analysis/run_analysis.R`](analysis/run_analysis.R) is the reproducible source of the model results and figures.

## Data provenance

The project uses the [Statlog German Credit Data from the UCI Machine Learning Repository][1]. The original documentation is included in `analysis/data/german.doc`. The dataset is used as a historical benchmark for demonstrating a reproducible analytics workflow.

[1]: https://archive.ics.uci.edu/ml/datasets/Statlog+(German+Credit+Data) "Statlog (German Credit Data), UCI Machine Learning Repository"
