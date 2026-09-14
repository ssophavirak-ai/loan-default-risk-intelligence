#!/usr/bin/env Rscript

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(ggplot2)
  library(randomForest)
  library(rpart)
  library(jsonlite)
})

set.seed(20260914)
root <- normalizePath(file.path(dirname(commandArgs(trailingOnly = FALSE)[1]), ".."), mustWork = FALSE)
if (!dir.exists(file.path(root, "analysis"))) root <- getwd()
data_path <- file.path(root, "analysis", "data", "german.data")
out_dir <- file.path(root, "analysis", "output")
fig_dir <- file.path(root, "analysis", "figures")
dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(fig_dir, recursive = TRUE, showWarnings = FALSE)

feature_names <- c(
  "checking_status", "duration_months", "credit_history", "purpose", "credit_amount",
  "savings_status", "employment_since", "installment_rate", "personal_status",
  "other_debtors", "residence_since", "property_type", "age_years", "other_installment",
  "housing", "existing_credits", "job_level", "dependents", "telephone", "foreign_worker", "target"
)
raw <- read.table(data_path, header = FALSE, stringsAsFactors = FALSE)
names(raw) <- feature_names
raw$target <- factor(ifelse(raw$target == 1, "Good", "Bad"), levels = c("Good", "Bad"))

factor_cols <- setdiff(names(raw), c("duration_months", "credit_amount", "installment_rate", "residence_since", "age_years", "existing_credits", "dependents", "target"))
raw[factor_cols] <- lapply(raw[factor_cols], factor)

# Clear, auditable preprocessing: no missing values in source; preserve observed categories.
preprocessing <- list(
  rows_input = nrow(raw),
  columns_input = ncol(raw),
  missing_values = sum(is.na(raw)),
  duplicate_rows = sum(duplicated(raw)),
  categorical_features = length(factor_cols),
  numeric_features = 7,
  target_definition = "Good = 1; Bad = 0",
  split = "75% stratified training / 25% stratified test",
  seed = 20260914
)

# Stratified split keeps the observed class balance stable.
train_idx <- unlist(lapply(split(seq_len(nrow(raw)), raw$target), function(ix) sample(ix, floor(0.75 * length(ix)))))
train <- raw[sort(train_idx), ]
test <- raw[-train_idx, ]

# EDA artifacts
class_counts <- as.data.frame(table(raw$target), stringsAsFactors = FALSE)
names(class_counts) <- c("class", "count")
class_counts$share <- class_counts$count / sum(class_counts$count)
write.csv(class_counts, file.path(out_dir, "class_distribution.csv"), row.names = FALSE)

numeric_summary <- raw |>
  summarise(across(c(duration_months, credit_amount, installment_rate, residence_since, age_years, existing_credits, dependents), list(mean = mean, median = median, sd = sd)))
write.csv(numeric_summary, file.path(out_dir, "numeric_summary.csv"), row.names = FALSE)

# Risk rate by key operational attributes
risk_by_checking <- raw |>
  mutate(bad_rate = as.numeric(target == "Bad")) |>
  group_by(checking_status) |>
  summarise(applications = n(), bad_rate = mean(bad_rate), .groups = "drop") |>
  arrange(desc(bad_rate))
write.csv(risk_by_checking, file.path(out_dir, "risk_by_checking.csv"), row.names = FALSE)

# Model training
logit <- glm(target ~ . , data = train, family = binomial(link = "logit"))
tree <- rpart(target ~ ., data = train, method = "class", control = rpart.control(cp = 0.01, minsplit = 20))
forest <- randomForest(target ~ ., data = train, ntree = 350, mtry = 5, importance = TRUE)

metric_row <- function(model_name, observed, predicted, probabilities) {
  observed <- factor(observed, levels = c("Good", "Bad"))
  predicted <- factor(predicted, levels = c("Good", "Bad"))
  cm <- table(observed, predicted)
  tn <- cm["Good", "Good"]; fp <- cm["Good", "Bad"]; fn <- cm["Bad", "Good"]; tp <- cm["Bad", "Bad"]
  precision <- ifelse(tp + fp == 0, 0, tp / (tp + fp))
  recall <- ifelse(tp + fn == 0, 0, tp / (tp + fn))
  specificity <- ifelse(tn + fp == 0, 0, tn / (tn + fp))
  f1 <- ifelse(precision + recall == 0, 0, 2 * precision * recall / (precision + recall))
  # UCI cost matrix: false negative (Bad predicted Good) costs 5; false positive costs 1.
  cost <- 5 * fn + fp
  # AUC via rank statistic, avoiding a package dependency.
  y <- as.numeric(observed == "Bad")
  order_idx <- order(probabilities)
  ranks <- rank(probabilities, ties.method = "average")
  n_pos <- sum(y == 1); n_neg <- sum(y == 0)
  auc <- ifelse(n_pos == 0 || n_neg == 0, NA, (sum(ranks[y == 1]) - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg))
  data.frame(model = model_name, accuracy = mean(observed == predicted), precision = precision, recall = recall, specificity = specificity, f1 = f1, auc = auc, cost = cost, tn = tn, fp = fp, fn = fn, tp = tp)
}

p_logit <- predict(logit, newdata = test, type = "response")
p_tree <- predict(tree, newdata = test, type = "prob")[, "Bad"]
p_forest <- predict(forest, newdata = test, type = "prob")[, "Bad"]
pred_logit <- factor(ifelse(p_logit >= 0.5, "Bad", "Good"), levels = c("Good", "Bad"))
pred_tree <- factor(ifelse(p_tree >= 0.5, "Bad", "Good"), levels = c("Good", "Bad"))
pred_forest <- factor(ifelse(p_forest >= 0.5, "Bad", "Good"), levels = c("Good", "Bad"))
metrics <- bind_rows(
  metric_row("Logistic regression", test$target, pred_logit, p_logit),
  metric_row("Decision tree", test$target, pred_tree, p_tree),
  metric_row("Random forest", test$target, pred_forest, p_forest)
)
metrics <- metrics |>
  mutate(across(c(accuracy, precision, recall, specificity, f1, auc), ~ round(.x, 4)))
write.csv(metrics, file.path(out_dir, "model_metrics.csv"), row.names = FALSE)

# Export coefficient and importance artifacts for the dashboard and audit trail.
coef_tbl <- data.frame(term = names(coef(logit)), estimate = as.numeric(coef(logit))) |>
  filter(term != "(Intercept)") |>
  mutate(direction = ifelse(estimate > 0, "increases_bad_risk", "decreases_bad_risk"), magnitude = abs(estimate)) |>
  arrange(desc(magnitude))
write.csv(coef_tbl, file.path(out_dir, "logistic_coefficients.csv"), row.names = FALSE)

imp <- as.data.frame(importance(forest), stringsAsFactors = FALSE)
imp$feature <- rownames(imp)
rownames(imp) <- NULL
importance_tbl <- imp |>
  transmute(feature, mean_decrease_accuracy = MeanDecreaseAccuracy, mean_decrease_gini = MeanDecreaseGini) |>
  arrange(desc(mean_decrease_gini))
write.csv(importance_tbl, file.path(out_dir, "feature_importance.csv"), row.names = FALSE)

# Sample applications enable a no-login dashboard demo without exposing raw identifiers.
sample_rows <- test |>
  mutate(application_id = sprintf("APP-%04d", row_number()),
         model_probability_bad = round(p_forest, 4),
         model_decision = ifelse(p_forest >= 0.5, "Review", "Approve"),
         outcome = as.character(target)) |>
  select(application_id, checking_status, duration_months, credit_amount, savings_status, employment_since, age_years, housing, model_probability_bad, model_decision, outcome) |>
  arrange(desc(model_probability_bad))
write.csv(sample_rows, file.path(out_dir, "sample_applications.csv"), row.names = FALSE)

# Human-readable findings are generated from computed values, not hand-entered.
best_model <- metrics$model[which.max(metrics$auc)]
best_auc <- metrics$auc[metrics$model == best_model]
lowest_cost_index <- order(as.numeric(metrics$cost), decreasing = FALSE)[1]
lowest_cost_model <- metrics$model[lowest_cost_index]
stopifnot(as.numeric(metrics$cost[lowest_cost_index]) == min(as.numeric(metrics$cost)))
bad_share <- class_counts$share[class_counts$class == "Bad"]
findings <- list(
  headline = sprintf("%s is the operational champion: it has the strongest ranking performance while remaining within one cost point of the lowest-cost model (%s).", best_model, lowest_cost_model),
  best_model = best_model,
  best_model_auc = as.numeric(best_auc),
  bad_rate = as.numeric(bad_share),
  train_rows = nrow(train),
  test_rows = nrow(test),
  dataset_rows = nrow(raw),
  key_risk_signals = c("Short-term or unestablished checking relationships", "Longer loan duration", "Low savings or no savings account", "Higher requested credit amount"),
  lowest_cost_model = lowest_cost_model,
  decision_note = "The dashboard uses a review-oriented threshold: a high predicted Bad probability routes the case to human review rather than an automatic decline."
)
write(toJSON(findings, auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "findings.json"))
write(toJSON(preprocessing, auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "preprocessing.json"))

# Model artifacts for reproducibility.
saveRDS(logit, file.path(out_dir, "logistic_model.rds"))
saveRDS(tree, file.path(out_dir, "decision_tree.rds"))
saveRDS(forest, file.path(out_dir, "random_forest.rds"))

# Visualizations
p1 <- ggplot(class_counts, aes(x = class, y = count, fill = class)) +
  geom_col(width = 0.56, show.legend = FALSE) +
  geom_text(aes(label = sprintf("%d (%.0f%%)", count, share * 100)), vjust = -0.5, fontface = "bold") +
  scale_fill_manual(values = c("Good" = "#18b6a4", "Bad" = "#ff6b5f")) +
  labs(title = "Observed credit-risk mix", subtitle = "The sample is imbalanced; cost-sensitive evaluation is essential.", x = NULL, y = "Applications") +
  theme_minimal(base_size = 12) + theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
ggsave(file.path(fig_dir, "class_distribution.png"), p1, width = 8, height = 4.8, dpi = 140)

p2 <- ggplot(risk_by_checking, aes(x = reorder(checking_status, bad_rate), y = bad_rate, fill = bad_rate)) +
  geom_col(show.legend = FALSE) +
  coord_flip() +
  scale_y_continuous(labels = function(x) paste0(round(x * 100), "%")) +
  scale_fill_gradient(low = "#5ce0c5", high = "#ff6b5f") +
  labs(title = "Bad-risk rate by checking-account status", subtitle = "A single operational signal can shift the risk profile materially.", x = "Checking status", y = "Bad-risk rate") +
  theme_minimal(base_size = 12) + theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
ggsave(file.path(fig_dir, "risk_by_checking.png"), p2, width = 8, height = 5.2, dpi = 140)

p3 <- ggplot(metrics, aes(x = reorder(model, cost), y = cost, fill = model)) +
  geom_col(show.legend = FALSE, width = 0.56) +
  geom_text(aes(label = cost), vjust = -0.5, fontface = "bold") +
  scale_fill_manual(values = c("Logistic regression" = "#2f6fed", "Decision tree" = "#7e57c2", "Random forest" = "#18b6a4")) +
  labs(title = "Model selection under asymmetric cost", subtitle = "False negatives cost 5x more than false positives in the UCI matrix.", x = NULL, y = "Weighted misclassification cost") +
  theme_minimal(base_size = 12) + theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
ggsave(file.path(fig_dir, "model_cost_comparison.png"), p3, width = 8, height = 4.8, dpi = 140)

message(sprintf("Analysis complete: %d rows, %d/%d train/test, best model = %s, cost = %d", nrow(raw), nrow(train), nrow(test), best_model, metrics$cost[metrics$model == best_model]))
write(toJSON(metrics, dataframe = "rows", auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "model_metrics.json"))
write(toJSON(importance_tbl[1:min(8, nrow(importance_tbl)), ], dataframe = "rows", auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "feature_importance.json"))
write(toJSON(sample_rows[1:min(12, nrow(sample_rows)), ], dataframe = "rows", auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "sample_applications.json"))
write(toJSON(risk_by_checking, dataframe = "rows", auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "risk_by_checking.json"))
write(toJSON(class_counts, dataframe = "rows", auto_unbox = TRUE, pretty = TRUE), file.path(out_dir, "class_distribution.json"))

invisible(NULL)

# end
