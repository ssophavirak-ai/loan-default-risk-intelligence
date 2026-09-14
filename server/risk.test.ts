import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("risk.summary", () => {
  it("returns the computed portfolio summary and champion model", async () => {
    const result = await appRouter.createCaller(createContext()).risk.summary();
    expect(result.dataset.applications).toBe(1000);
    expect(result.dataset.badRate).toBe(0.3);
    expect(result.bestModel.name).toBe("Random forest");
    expect(result.modelMetrics).toHaveLength(3);
    expect(result.featureImportance[0]?.feature).toBe("Credit amount");
  });
});

describe("risk.predict", () => {
  it("routes a high-exposure profile to review and returns drivers", async () => {
    const result = await appRouter.createCaller(createContext()).risk.predict({
      amount: 15945,
      duration: 60,
      age: 23,
      checking: "below_zero",
      savings: "low",
      employment: "unemployed",
      housing: "rent",
    });
    expect(result.model).toBe("Random forest");
    expect(result.decision).toBe("Review");
    expect(result.probability).toBeGreaterThanOrEqual(0.7);
    expect(result.drivers.length).toBeGreaterThan(0);
  });

  it("keeps a lower-exposure profile below the review threshold", async () => {
    const result = await appRouter.createCaller(createContext()).risk.predict({
      amount: 1200,
      duration: 12,
      age: 45,
      checking: "none",
      savings: "high",
      employment: "seven_plus",
      housing: "own",
    });
    expect(result.decision).toBe("Approve");
    expect(result.probability).toBeLessThan(0.5);
  });
});
