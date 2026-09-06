import { describe, expect, test } from "vitest";
import { mockRunService } from "@/services/RunService";
import { mockDecisionService } from "@/services/DecisionService";
import { mockEvidenceService } from "@/services/EvidenceService";
import { mockGuidedReviewService } from "@/services/GuidedReviewService";
import { mockRecipeService } from "@/services/RecipeService";
import { mockHistoryService } from "@/services/HistoryService";
import { mockModelsPolicyService } from "@/services/ModelsPolicyService";
import { mockTodayService } from "@/services/TodayService";
import { mockFirstRunService } from "@/services/FirstRunService";
import { mockShellService } from "@/services/ShellService";

describe("RunService mock satisfies contract", () => {
  test("getLiveRunData returns complete run bundle", () => {
    const data = mockRunService.getLiveRunData();
    expect(data.meta).toHaveProperty("runId");
    expect(data.meta).toHaveProperty("title");
    expect(Array.isArray(data.steps)).toBe(true);
    expect(data.steps.length).toBeGreaterThan(0);
    expect(Array.isArray(data.kpis)).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
    expect(Array.isArray(data.decisions)).toBe(true);
    expect(Array.isArray(data.evidenceCards)).toBe(true);
    expect(data.stepInspector).toHaveProperty("stepIndex");
  });
});

describe("DecisionService mock satisfies contract", () => {
  test("getDecisions returns non-empty array of Decision objects", () => {
    const decisions = mockDecisionService.getDecisions();
    expect(Array.isArray(decisions)).toBe(true);
    expect(decisions.length).toBeGreaterThan(0);
    const first = decisions[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("type");
    expect(first).toHaveProperty("risk");
    expect(first).toHaveProperty("status");
  });
});

describe("EvidenceService mock satisfies contract", () => {
  test("getEvidenceRecords returns non-empty array", () => {
    const records = mockEvidenceService.getEvidenceRecords();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
    const first = records[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("status");
    expect(Array.isArray(first.sources)).toBe(true);
    expect(Array.isArray(first.provenance)).toBe(true);
  });

  test("getProjectName returns a non-empty string", () => {
    expect(typeof mockEvidenceService.getProjectName()).toBe("string");
    expect(mockEvidenceService.getProjectName().length).toBeGreaterThan(0);
  });
});

describe("GuidedReviewService mock satisfies contract", () => {
  test("getReviewData returns complete review bundle", () => {
    const data = mockGuidedReviewService.getReviewData();
    expect(typeof data.project).toBe("string");
    expect(data.progress).toHaveProperty("reviewed");
    expect(data.progress).toHaveProperty("total");
    expect(data.currentPaper).toHaveProperty("id");
    expect(data.currentPaper).toHaveProperty("abstract");
    expect(Array.isArray(data.nextPapers)).toBe(true);
    expect(Array.isArray(data.excludeReasons)).toBe(true);
    expect(Array.isArray(data.previousDecisions)).toBe(true);
  });
});

describe("RecipeService mock satisfies contract", () => {
  test("getRecipes returns non-empty Recipe array", () => {
    const recipes = mockRecipeService.getRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBeGreaterThan(0);
    const first = recipes[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("execution");
    expect(Array.isArray(first.steps)).toBe(true);
  });
});

describe("HistoryService mock satisfies contract", () => {
  test("getRuns returns non-empty HistoryRun array", () => {
    const runs = mockHistoryService.getRuns();
    expect(Array.isArray(runs)).toBe(true);
    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0]).toHaveProperty("id");
    expect(runs[0]).toHaveProperty("status");
    expect(Array.isArray(runs[0]!.providers)).toBe(true);
  });
});

describe("ModelsPolicyService mock satisfies contract", () => {
  test("getProviders returns non-empty PolicyProvider array", () => {
    const providers = mockModelsPolicyService.getProviders();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
    expect(providers[0]).toHaveProperty("id");
    expect(providers[0]).toHaveProperty("type");
    expect(providers[0]).toHaveProperty("egressPolicy");
    expect(Array.isArray(providers[0]!.capabilities)).toBe(true);
  });

  test("getRoutingOptions returns valid routing options", () => {
    const opts = mockModelsPolicyService.getRoutingOptions();
    expect(Array.isArray(opts)).toBe(true);
    expect(opts).toContain("prefer");
    expect(opts).toContain("disabled");
  });
});

describe("TodayService mock satisfies contract", () => {
  test("getTodayData returns valid TodayData", () => {
    const data = mockTodayService.getTodayData();
    expect(typeof data.project).toBe("string");
    expect(typeof data.question).toBe("string");
    expect(data.waiting).toHaveProperty("title");
    expect(data.run).toHaveProperty("progress");
    expect(Array.isArray(data.sources)).toBe(true);
    expect(Array.isArray(data.files)).toBe(true);
  });
});

describe("FirstRunService mock satisfies contract", () => {
  test("getOnboardingConfig returns complete OnboardingConfig", () => {
    const cfg = mockFirstRunService.getOnboardingConfig();
    expect(cfg.stepCount).toBeGreaterThan(0);
    expect(Array.isArray(cfg.steps)).toBe(true);
    expect(Array.isArray(cfg.sourceOptions)).toBe(true);
    expect(Array.isArray(cfg.cloudOptions)).toBe(true);
    expect(Array.isArray(cfg.egressOptions)).toBe(true);
    expect(cfg.workspaceDefaults).toHaveProperty("defaultPath");
  });
});

describe("ShellService mock satisfies contract", () => {
  test("getShellConfig returns complete ShellConfig", () => {
    const cfg = mockShellService.getShellConfig();
    expect(cfg.applicationMeta).toHaveProperty("brand");
    expect(Array.isArray(cfg.navigationGroups)).toBe(true);
    expect(Array.isArray(cfg.paletteItems)).toBe(true);
    expect(cfg.themeNote).toHaveProperty("night");
    expect(cfg.themeNote).toHaveProperty("day");
  });
});
