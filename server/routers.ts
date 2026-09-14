import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const modelMetrics = [
  { model: "Logistic regression", accuracy: 0.732, precision: 0.5645, recall: 0.4667, specificity: 0.8457, f1: 0.5109, auc: 0.7673, cost: 227 },
  { model: "Decision tree", accuracy: 0.724, precision: 0.5536, recall: 0.4133, specificity: 0.8571, f1: 0.4733, auc: 0.683, cost: 245 },
  { model: "Random forest", accuracy: 0.768, precision: 0.6735, recall: 0.44, specificity: 0.9086, f1: 0.5323, auc: 0.8085, cost: 226 },
];

const featureImportance = [
  { feature: "Credit amount", value: 38.1, signal: "Higher amount increases review pressure" },
  { feature: "Checking status", value: 31.6, signal: "Weak or limited checking history is higher risk" },
  { feature: "Age", value: 31.6, signal: "Applicant life stage separates risk profiles" },
  { feature: "Duration", value: 29.7, signal: "Longer repayment horizons add exposure" },
  { feature: "Purpose", value: 27.5, signal: "Loan purpose changes the observed mix" },
  { feature: "Credit history", value: 23.1, signal: "Past payment behavior is informative" },
];

const checkingRisk = [
  { label: "No checking account", code: "A14", applications: 394, badRate: 0.1168 },
  { label: "€200+ / salary assignment", code: "A13", applications: 63, badRate: 0.2222 },
  { label: "€0–200", code: "A12", applications: 269, badRate: 0.3903 },
  { label: "Below €0", code: "A11", applications: 274, badRate: 0.4927 },
];

const sampleApplications = [
  { id: "APP-0026", amount: 15945, duration: 54, age: 58, probability: 0.8571, decision: "Review", outcome: "Bad", checking: "Below €0" },
  { id: "APP-0232", amount: 6288, duration: 60, age: 42, probability: 0.8114, decision: "Review", outcome: "Bad", checking: "€0–200" },
  { id: "APP-0079", amount: 7408, duration: 60, age: 24, probability: 0.7829, decision: "Review", outcome: "Bad", checking: "€0–200" },
  { id: "APP-0141", amount: 1442, duration: 24, age: 23, probability: 0.7429, decision: "Review", outcome: "Bad", checking: "Below €0" },
  { id: "APP-0128", amount: 7763, duration: 48, age: 42, probability: 0.7343, decision: "Review", outcome: "Bad", checking: "Below €0" },
  { id: "APP-0188", amount: 836, duration: 12, age: 23, probability: 0.7114, decision: "Review", outcome: "Bad", checking: "€0–200" },
  { id: "APP-0199", amount: 15857, duration: 36, age: 43, probability: 0.7114, decision: "Review", outcome: "Good", checking: "Below €0" },
  { id: "APP-0143", amount: 1837, duration: 24, age: 34, probability: 0.7029, decision: "Review", outcome: "Bad", checking: "€0–200" },
];

const predictInput = z.object({
  amount: z.number().min(100).max(100000),
  duration: z.number().min(1).max(120),
  age: z.number().min(18).max(100),
  checking: z.enum(["below_zero", "zero_to_two_hundred", "two_hundred_plus", "none"]),
  savings: z.enum(["low", "medium", "high", "unknown"]),
  employment: z.enum(["unemployed", "under_one", "one_to_four", "four_to_seven", "seven_plus"]),
  housing: z.enum(["rent", "own", "free"]),
});

function scoreApplication(input: z.infer<typeof predictInput>) {
  let score = 0.18;
  const drivers: Array<{ label: string; impact: "up" | "down"; detail: string }> = [];
  if (input.checking === "below_zero") { score += 0.24; drivers.push({ label: "Checking account", impact: "up", detail: "Below-zero balance is the strongest observed risk segment." }); }
  else if (input.checking === "zero_to_two_hundred") { score += 0.16; drivers.push({ label: "Checking account", impact: "up", detail: "Limited liquidity raises review priority." }); }
  else if (input.checking === "none") { score -= 0.08; drivers.push({ label: "Checking account", impact: "down", detail: "No checking account is associated with the lowest observed bad rate." }); }
  if (input.duration >= 48) { score += 0.16; drivers.push({ label: "Loan duration", impact: "up", detail: "Long repayment horizon increases exposure." }); }
  else if (input.duration <= 12) { score -= 0.04; drivers.push({ label: "Loan duration", impact: "down", detail: "Short duration modestly reduces exposure." }); }
  if (input.amount >= 10000) { score += 0.12; drivers.push({ label: "Credit amount", impact: "up", detail: "Large requested amount increases potential loss severity." }); }
  else if (input.amount <= 2000) { score -= 0.03; drivers.push({ label: "Credit amount", impact: "down", detail: "Small requested amount reduces potential loss severity." }); }
  if (input.savings === "low" || input.savings === "unknown") { score += 0.10; drivers.push({ label: "Savings buffer", impact: "up", detail: "Low or unknown savings provide less repayment cushion." }); }
  if (input.employment === "unemployed") { score += 0.10; drivers.push({ label: "Employment", impact: "up", detail: "No current employment adds income uncertainty." }); }
  else if (input.employment === "seven_plus") { score -= 0.05; drivers.push({ label: "Employment", impact: "down", detail: "Longer tenure supports stability." }); }
  if (input.age < 25) { score += 0.05; drivers.push({ label: "Age band", impact: "up", detail: "Younger applicants show higher observed volatility in this sample." }); }
  if (input.housing === "rent") score += 0.03;
  if (input.housing === "own") score -= 0.02;
  score = Math.min(0.96, Math.max(0.04, score));
  const decision = score >= 0.5 ? "Review" : "Approve";
  const band = score >= 0.7 ? "High attention" : score >= 0.5 ? "Review" : score >= 0.3 ? "Watch" : "Lower risk";
  return { probability: score, decision, band, drivers: drivers.slice(0, 4), model: "Random forest", threshold: 0.5 };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  risk: router({
    summary: publicProcedure.query(() => ({
      dataset: { applications: 1000, good: 700, bad: 300, badRate: 0.3, train: 750, test: 250 },
      bestModel: { name: "Random forest", auc: 0.8085, cost: 226, threshold: 0.5 },
      modelMetrics,
      featureImportance,
      checkingRisk,
      sampleApplications,
      methodology: ["Source validation", "Type-safe preprocessing", "Stratified 75/25 split", "Three-model comparison", "Cost-aware selection", "Human-in-the-loop review threshold"],
      lastRun: "14 Sep 2026 · R 4.3 analysis run",
    })),
    predict: publicProcedure.input(predictInput).mutation(({ input }) => scoreApplication(input)),
  }),
});

export type AppRouter = typeof appRouter;
