# Loan Default Risk Intelligence

## Executive summary

**Loan Default Risk Intelligence** is a full-stack classification project that turns a historical credit-risk dataset into a review-oriented decision product. The project combines a reproducible R analysis pipeline with a React dashboard and a typed prediction procedure. Its purpose is to demonstrate the complete workflow expected of a professional data analyst: source validation, preprocessing, exploratory analysis, model comparison, evaluation, interpretation, and productization.

The Random Forest model is the operational champion for ranking quality, with a held-out test AUC of **0.8085** and accuracy of **76.8%**. It also has the lowest observed weighted error cost at 226, narrowly ahead of logistic regression at 227. This shows why model selection should reflect the business loss function rather than accuracy alone. The dashboard therefore exposes both metrics and routes high-risk cases to **human review** instead of making an automatic approval or decline decision.

## Business question

A credit operations team needs a consistent way to prioritize loan applications for review. The analytical question is:

> Given an applicant’s financial profile and loan characteristics, how can a classification model estimate the probability of a bad credit outcome while preserving an interpretable review workflow?

The project is deliberately framed as **decision support**. A model output is not a credit decision. It is a signal that should be reviewed against policy, additional evidence, and applicable fairness and compliance controls.

## Dataset and provenance

The analysis uses the **Statlog (German Credit Data)** dataset from the UCI Machine Learning Repository. The source contains **1,000 applications**, **20 predictors**, and a binary credit-risk outcome. The original UCI documentation states that the dataset has no missing values and provides an asymmetric cost matrix in which classifying a bad-risk applicant as good is five times more costly than classifying a good-risk applicant as bad.[1]

The dataset is used as a historical benchmark for demonstrating an analytical workflow. It should not be treated as a current underwriting population or deployed as a production credit policy without extensive validation.

| Dataset characteristic | Value |
|---|---:|
| Applications | 1,000 |
| Predictors | 20 |
| Observed good outcomes | 700 |
| Observed bad outcomes | 300 |
| Bad-risk share | 30.0% |
| Missing values | 0 |
| Target encoding | Good = 1; Bad = 0 |

## Analytical workflow

### Data preparation

The raw UCI file is stored at `analysis/data/german.data`. The R pipeline reads the space-delimited source, assigns documented feature names, converts categorical variables to factors, and encodes the target as an ordered factor with `Good` and `Bad` levels. No imputation is performed because the source documentation reports no missing values.

The pipeline records the number of input rows, columns, missing values, duplicate rows, numeric variables, categorical variables, random seed, and split strategy in `analysis/output/preprocessing.json`. This creates an auditable preprocessing record rather than hiding preparation steps inside a notebook.

### Exploratory analysis

The exploratory analysis establishes the outcome mix and investigates risk concentration by checking-account status. The strongest observed segment difference is visible in the checking-account breakdown:

| Checking-account segment | Applications | Bad-risk rate |
|---|---:|---:|
| Below €0 | 274 | 49.3% |
| €0–200 | 269 | 39.0% |
| €200+ / salary assignment | 63 | 22.2% |
| No checking account | 394 | 11.7% |

This is an association in the benchmark data, not a causal conclusion. It is valuable because it demonstrates how a dashboard can reveal operational segments that deserve review.

The R pipeline generates the following figures:

- `analysis/figures/class_distribution.png` shows the observed target mix.
- `analysis/figures/risk_by_checking.png` shows bad-risk rate by checking-account status.
- `analysis/figures/model_cost_comparison.png` compares weighted error cost across models.

### Train/test design

The dataset is split into **750 training rows** and **250 held-out test rows** using a fixed random seed and stratified sampling. Stratification preserves the observed class mix in both partitions and makes the comparison reproducible.

### Model comparison

Three classification models are fitted in R:

1. **Logistic regression** provides a transparent statistical baseline.
2. **Decision tree** provides a compact rule-based model.
3. **Random Forest** provides a nonlinear ensemble model and variable-importance diagnostics.

The models are compared on accuracy, precision, recall, specificity, F1 score, AUC, and the UCI weighted error cost. AUC measures ranking quality across thresholds. The weighted cost emphasizes the consequence of false negatives, which is appropriate for a review-prioritization workflow where missing a bad-risk case is more costly than reviewing an additional good-risk case.

| Model | Accuracy | Precision | Recall | Specificity | F1 | AUC | Weighted cost |
|---|---:|---:|---:|---:|---:|---:|---:|
| Logistic regression | 73.2% | 56.5% | 46.7% | 84.6% | 51.1% | 0.7673 | 227 |
| Decision tree | 72.4% | 55.4% | 41.3% | 85.7% | 47.3% | 0.6830 | 245 |
| Random Forest | **76.8%** | **67.4%** | 44.0% | **90.9%** | **53.2%** | **0.8085** | 226 |

The Random Forest is selected as the dashboard’s champion because it provides the strongest ranking quality, the highest accuracy, and the lowest observed weighted cost. This is a more defensible selection than choosing a model based on a single metric.

## Product implementation

The full-stack application is implemented with React, Tailwind CSS, Recharts, Express, and tRPC. The `risk.summary` procedure exposes the computed dataset summary, model metrics, feature importance, segment risk rates, monitoring sample, and methodology metadata. The `risk.predict` procedure accepts an applicant profile and returns:

- a bad-risk probability,
- a review-oriented decision,
- a risk band,
- a threshold,
- and a short list of driver explanations.

The prediction surface is intentionally designed as a **triage layer**. It does not expose an automatic decline action. The interface makes the threshold visible and describes why the case was routed for review.

The dashboard includes:

| Experience | Purpose |
|---|---|
| Overview | Communicates the project outcome and key KPIs. |
| Model lab | Compares the three fitted models. |
| Explainability | Shows feature importance and operational signal differences. |
| Application scorer | Runs an interactive prediction from applicant inputs. |
| Monitoring sample | Displays held-out cases sorted by predicted risk. |
| Methodology | Documents the reproducible analysis lifecycle. |

## Reproducibility

From the project root, run:

```bash
Rscript analysis/run_analysis.R
pnpm check
pnpm build
pnpm test
```

The R script writes structured outputs to `analysis/output/`, including CSV and JSON summaries, model metrics, feature importance, sample applications, preprocessing metadata, and serialized R model objects. The source dataset and the analysis script are kept in the repository so the result can be rerun and inspected.

## Limitations and responsible use

The dataset is historical, small, and not representative of a current lending portfolio. The target label reflects a prior classification context rather than a universal definition of default. The feature set includes sensitive or proxy-like attributes that would require careful governance before any real-world use. The dashboard’s TypeScript scorer is a product demonstration of the selected feature logic and is not a substitute for validating and deploying the serialized R model in a controlled production environment.

A production-grade implementation would require out-of-time validation, population stability monitoring, calibration analysis, fairness assessment, documentation of adverse-action reasons, threshold governance, drift monitoring, access control, audit logs, and a formal model risk-management process. The project should therefore be evaluated as a **portfolio-quality demonstration of the analytics lifecycle**, not as an underwriting system.

## References

[1]: https://archive.ics.uci.edu/ml/datasets/Statlog+(German+Credit+Data) "Statlog (German Credit Data), UCI Machine Learning Repository"

[2]: https://www.r-project.org/ "The R Project for Statistical Computing"

[3]: https://cran.r-project.org/web/packages/randomForest/index.html "randomForest: Breiman and Cutler's Random Forests for Classification and Regression"
