# Loan Default Risk Intelligence

A portfolio-grade full-stack data analytics project for loan default classification, model comparison, explainability, and review-oriented prediction.

## What is included

- A reproducible R analysis pipeline using the UCI Statlog German Credit dataset.
- Data preprocessing, exploratory analysis, stratified train/test split, and three classification models.
- Cost-aware evaluation using accuracy, precision, recall, specificity, F1, AUC, and the UCI asymmetric cost matrix.
- A React + Tailwind + Recharts dashboard with typed tRPC procedures.
- An interactive application scorer that returns a probability, risk band, review decision, and driver summary.
- Generated JSON, CSV, PNG, and RDS analysis artifacts.
- A written project report and a two-minute demo script.

## Run the analysis

```bash
Rscript analysis/run_analysis.R
```

The analysis writes outputs to `analysis/output/` and figures to `analysis/figures/`.

## Run the web application

```bash
pnpm install
pnpm dev
```

## Validate the project

```bash
pnpm check
pnpm build
pnpm test
```

## Project structure

```text
analysis/
  data/                 # UCI source data and documentation
  figures/              # R-generated visualizations
  output/               # R-generated CSV, JSON, and RDS artifacts
  run_analysis.R        # reproducible end-to-end analysis
client/src/
  pages/Home.tsx        # dashboard and scorer experience
  index.css             # visual system and responsive layout
server/routers.ts       # typed summary and prediction procedures
docs/
  PROJECT_REPORT.md     # portfolio report and methodology
  VIDEO_SCRIPT.md       # two-minute demo narration
```

## Model result

The Random Forest model is the dashboard champion for ranking quality with a held-out AUC of **0.8085** and the lowest observed weighted error cost of 226. The product makes the metrics visible and routes higher-risk profiles to review rather than making an automatic credit decision.

## Data provenance

The source is the [UCI Statlog German Credit dataset][1]. The dataset is used as a historical benchmark for demonstrating a reproducible analytics workflow. It is not suitable as a stand-alone production underwriting policy.

[1]: https://archive.ics.uci.edu/ml/datasets/Statlog+(German+Credit+Data) "Statlog (German Credit Data), UCI Machine Learning Repository"
