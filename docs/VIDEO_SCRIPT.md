# Two-minute project demo script

## 0:00–0:15 — Opening

This project is Loan Default Risk Intelligence, a full-stack classification workflow for prioritizing loan applications for review. It combines an R modeling pipeline with a decision-ready web dashboard.

## 0:15–0:35 — Dataset and question

The project uses the UCI Statlog German Credit dataset. It contains 1,000 historical applications, 20 predictors, and a binary good-versus-bad credit-risk outcome. The key business question is: can we estimate bad-risk probability well enough to focus analyst attention, while keeping the final decision human-reviewed?

## 0:35–0:55 — Preparation and exploration

The R pipeline reads the original source, assigns the documented feature names, converts categorical fields to factors, checks for missing values and duplicates, and performs a fixed stratified 75/25 train-test split. The dataset has no missing values. One important exploratory result is the difference by checking-account status: the below-zero segment has a 49.3% bad-risk rate, while the no-checking-account segment has an 11.7% rate.

## 0:55–1:20 — Model comparison

I compare logistic regression, a decision tree, and Random Forest. I report accuracy, precision, recall, specificity, F1, AUC, and the documented asymmetric error cost. Random Forest is the champion for ranking quality, with a held-out AUC of 0.8085, accuracy of 76.8%, and the lowest observed weighted cost of 226. This makes the selection evidence-based instead of hiding it behind one metric.

## 1:20–1:45 — Dashboard walkthrough

The dashboard exposes the dataset KPIs, model comparison, feature importance, segment risk, and a monitoring sample of held-out applications. The application scorer lets us change amount, duration, age, checking status, savings, employment, and housing. The result shows a bad-risk probability, a review decision, a risk band, and the strongest drivers behind the route.

## 1:45–2:00 — Responsible use and close

This is a decision-support demonstration, not an automated underwriting system. High-risk cases are routed to human review rather than automatically declined. The repository includes the original data, the R script, generated artifacts, report, and this demo script so the full analysis can be rerun and reviewed.
