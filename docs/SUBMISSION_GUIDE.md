# Teacher Submission Guide

## Recommended submission contents

Submit the GitHub repository, the live dashboard URL, and the formal project report together. The repository contains the reproducible R analysis, generated analytical artifacts, full-stack React and Express application, tests, and project documentation.

| Deliverable | Link or file |
|---|---|
| GitHub repository | https://github.com/ssophavirak-ai/loan-default-risk-intelligence |
| Live dashboard | https://loan-default-risk-intelligence.onrender.com/ |
| Formal report | `docs/PROJECT_REPORT.md` |
| Demo narration | `docs/VIDEO_SCRIPT.md` |
| Reproducible analysis | `analysis/run_analysis.R` |

## Final verification

Open the live dashboard in a private browser window and check the Overview, Model lab, Explainability, Application scorer, and Methodology views. From the repository root, run the following commands:

```bash
pnpm install
pnpm check
pnpm build
pnpm test
```

To rerun the analytical pipeline, install the documented R packages and execute:

```bash
Rscript analysis/run_analysis.R
```

The project currently reports four passing Vitest tests. The committed CSV, JSON, PNG, and R model artifacts allow the dashboard to run without rerunning R.

## Suggested presentation order

Begin with the business question and the dataset. Explain the 75/25 stratified split, the three model candidates, the asymmetric error cost, and why Random Forest was selected. Then demonstrate the dashboard in this order: Overview, Model lab, Explainability, Application scorer, Monitoring sample, and Methodology. Close with the limitations: historical data, small sample, potential proxy variables, no production calibration, and human review required.

## Academic submission note

Be ready to explain the code, statistical choices, model metrics, and interface decisions in your own words. Follow the instructor's policy for documenting external tools or assistance, and do not present the dashboard as a production underwriting system.
