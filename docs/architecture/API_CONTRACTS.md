# NOETARCH API Contracts

**M4 integration contract — 2026-09-06**
**Status:** Mock-only. All services return synchronous static data. No backend calls exist.
**M5 note:** Each surface listed below gains async loading + error handling when its real client replaces the mock. No screen changes before that swap.

---

## 1 — Domain types (`src/contracts/`)

All types are the single source of truth. Components and services import from here; `src/data/` is only imported by mock service implementations.

### 1.1 Run (`contracts/run.ts`)

Used by: LiveRun surface (RunService) and History surface (HistoryService).

| Type | Shape |
|---|---|
| `StepState` | `"done" \| "partial" \| "running" \| "waiting" \| "queued" \| "blocked"` |
| `EventKind` | `"system" \| "model"` |
| `LiveRunDecisionKind` | `"pending" \| "approved" \| "skipped"` |
| `RunStatus` | `"running" \| "complete" \| "interrupted" \| "failed" \| "partial"` |
| `RunMeta` | `{ runId: string; title: string; started: string; elapsed: string }` |
| `WorkflowStep` | `{ index: number; label: string; state: StepState; note?: string }` |
| `RunKPI` | `{ label: string; value: string; tone?: "warn" \| "ok" \| "bad" }` |
| `RunEvent` | `{ id: string; time: string; message: string; kind: EventKind }` |
| `LiveRunDecision` | `{ id: string; description: string; kind: LiveRunDecisionKind }` |
| `LiveRunEvidenceCard` | `{ id: string; title: string; doi: string; source: string; verifiedBy: string }` |
| `StepInspector` | `{ stepIndex: number; label: string; method: string; locality: string; status: string; input: string; outputSoFar: string }` |
| `HistoryRun` | `{ id: string; status: RunStatus; title: string; recipe: string; started: string; stoppedAt?: string; duration: string; cost: string; papers: number; providers: string[]; notes?: string; stopReason?: string; failureReason?: string }` |

### 1.2 Decision (`contracts/decision.ts`)

Used by: Decision surface (DecisionService).

| Type | Shape |
|---|---|
| `DecisionRisk` | `"high" \| "medium" \| "low"` |
| `DecisionType` | `"cloud-egress" \| "local-file" \| "workflow-change"` |
| `DecisionStatus` | `"pending" \| "approved" \| "rejected" \| "alternative"` |
| `Decision` | `{ id: string; title: string; type: DecisionType; risk: DecisionRisk; payload?: string; cost: string; time: string; reversible: boolean; detail: string; alternatives: string[]; status: DecisionStatus; rejectedAt?: string }` |

### 1.3 Evidence (`contracts/evidence.ts`)

Used by: Evidence Library surface (EvidenceService).

| Type | Shape |
|---|---|
| `EvidenceStatus` | `"checked" \| "conflicting" \| "cannot-check"` |
| `EvidenceSource` | `{ name: string; found: boolean; note: string }` |
| `EvidenceRecord` | `{ id: string; title: string; authors: string; year: number; journal: string; doi: string \| null; status: EvidenceStatus; sources: EvidenceSource[]; provenance: string[]; agreementCount: number; totalSources: number; missingDoi?: boolean; conflictNote?: string }` |

### 1.4 Guided Review (`contracts/guided-review.ts`)

Used by: Guided Review surface (GuidedReviewService).

| Type | Shape |
|---|---|
| `ReviewDecision` | `"include" \| "exclude" \| "uncertain" \| "needs-human-review" \| null` |
| `ReviewPaper` | `{ id: string; index: number; title: string; authors: string; year: number; journal: string; doi: string; abstract: string; initialStatus: "needs-human-review" \| null; initialStatusNote: string \| null }` |
| `ExcludeReason` | `{ id: string; label: string }` |
| `ReviewHistoryEntry` | `{ id: string; paperTitle: string; decision: Exclude<ReviewDecision, null>; reasons: string[] }` |
| `ReviewProgress` | `{ reviewed: number; total: number; remaining: number }` |

### 1.5 Recipe (`contracts/recipe.ts`)

Used by: Recipe Library surface (RecipeService).

| Type | Shape |
|---|---|
| `RecipeExecution` | `"local" \| "cloud"` |
| `Recipe` | `{ id: string; name: string; description: string; execution: RecipeExecution; steps: string[]; inputs: string[]; outputs: string[]; estimatedCost: string; estimatedTime: string; providers: string[]; privacyPolicy: string }` |
| `CustomRecipe` | `Recipe & { originalId: string; customName: string }` |

### 1.6 Models & Policy (`contracts/models-policy.ts`)

Used by: Models & Policy surface (ModelsPolicyService).

| Type | Shape |
|---|---|
| `ProviderType` | `"cloud" \| "local"` |
| `ProviderStatus` | `"available" \| "down"` |
| `EgressPolicy` | `"explicit-approval" \| "none"` |
| `RoutingPreference` | `"prefer" \| "prefer-local-fallback" \| "allow" \| "disabled"` |
| `PolicyProvider` | `{ id: string; name: string; type: ProviderType; status: ProviderStatus; statusNote?: string; enabled: boolean; dailyCostLimit: number \| null; dataRetention: string; egressPolicy: EgressPolicy; capabilities: string[]; routingPreference: RoutingPreference; requiresApproval: boolean }` |
| `ROUTING_OPTIONS` | `RoutingPreference[]` — canonical ordering for UI |
| `ROUTING_PREFERENCE_LABELS` | `Record<RoutingPreference, string>` — display labels |

### 1.7 Today (`contracts/today.ts`)

Used by: Today Overview surface (TodayService).

| Type | Shape |
|---|---|
| `TodayKPITuple` | `readonly [string, string, string]` — `[label, value, tone]` |
| `TodaySourceTuple` | `readonly [string, string, string]` — `[name, state, tone]` |
| `TodayFileTuple` | `readonly [string, string, boolean]` — `[name, meta, isPending]` |
| `TodayFinishedTuple` | `readonly [string, string, string]` — `[title, meta, cost]` |
| `TodayWaiting` | `{ title: string; detail: string; next: string }` |
| `TodayRun` | `{ title: string; meta: string; current: string; progress: number; kpis: readonly TodayKPITuple[] }` |
| `TodayFailure` | `{ title: string; body: string }` |
| `TodayData` | `{ project: string; question: string; waiting: TodayWaiting; run: TodayRun; failure: TodayFailure; finished: readonly TodayFinishedTuple[]; sources: readonly TodaySourceTuple[]; files: readonly TodayFileTuple[] }` |

### 1.8 First Run / Onboarding (`contracts/first-run.ts`)

Used by: First Run surface (FirstRunService).

| Type | Shape |
|---|---|
| `FirstRunSource` | `{ id: string; name: string; type: "free" \| "paid"; description: string }` |
| `FirstRunCloudOption` | `{ id: string; label: string; description: string }` |
| `FirstRunEgressOption` | `{ id: string; label: string; description: string }` |
| `FirstRunStep` | `{ stepNumber: number; title: string; description: string }` |
| `WorkspaceDefaults` | `{ defaultPath: string; note: string }` |
| `ResearchQuestionDefaults` | `{ placeholder: string; hint: string }` |
| `SpendingLimitDefaults` | `{ defaultLimit: number; note: string }` |
| `OnboardingConfig` | `{ stepCount: number; steps: FirstRunStep[]; workspaceDefaults: WorkspaceDefaults; researchQuestionDefaults: ResearchQuestionDefaults; sourceOptions: FirstRunSource[]; defaultSelectedSources: string[]; cloudOptions: FirstRunCloudOption[]; defaultCloudOption: string; spendingLimitDefaults: SpendingLimitDefaults; egressOptions: FirstRunEgressOption[]; egressDefault: string \| null; egressNote: string }` |

### 1.9 Application Shell (`contracts/shell.ts`)

Used by: ApplicationShell / SidebarNavigation / CommandPalette surfaces (ShellService).

| Type | Shape |
|---|---|
| `NavigationItem` | `{ label: string; href: string; available: boolean }` |
| `NavigationGroup` | `{ label: string; items: NavigationItem[] }` |
| `PaletteItem` | `{ label: string; hint: string; href?: string; action?: "theme"; available: boolean }` |
| `ApplicationMeta` | `{ brand: string; tagline: string; storage: string; spend: string; budget: string; budgetPercent: number }` |
| `ThemeNote` | `{ night: string; day: string }` |
| `ShellConfig` | `{ applicationMeta: ApplicationMeta; navigationGroups: NavigationGroup[]; paletteItems: PaletteItem[]; themeNote: ThemeNote }` |

---

## 2 — Service interfaces and methods (`src/services/`)

Each service has an interface + a mock implementation (`mock*Service`). Screens import the mock. The mock→real swap replaces the export in one localized file change, adding async and error handling at that time.

### 2.1 RunService — `/live-run` screen

```typescript
interface RunService {
  getLiveRunData(): LiveRunData; // → async in M5
}

interface LiveRunData {
  meta: RunMeta;
  steps: WorkflowStep[];
  stepInspector: StepInspector;
  kpis: RunKPI[];
  events: RunEvent[];
  decisions: LiveRunDecision[];
  evidenceCards: LiveRunEvidenceCard[];
}
```

**Backend endpoint (M5):** `GET /api/runs/active` → `LiveRunData`
**Swap point:** `src/services/RunService.ts` — replace `mockRunService` export with a real client.
**Screen at swap time:** `LiveRun.tsx` gains loading skeleton + error banner at the data fetch boundary.

---

### 2.2 DecisionService — `/decisions` screen

```typescript
interface DecisionService {
  getDecisions(): Decision[]; // → async in M5
}
```

**Backend endpoint (M5):** `GET /api/decisions` → `Decision[]`
**Swap point:** `src/services/DecisionService.ts`
**Screen at swap time:** `DecisionCenter.tsx` gains loading state + retry on error.

---

### 2.3 EvidenceService — `/evidence` screen

```typescript
interface EvidenceService {
  getEvidenceRecords(): EvidenceRecord[]; // → async in M5
  getProjectName(): string;               // → async in M5
}
```

**Backend endpoint (M5):** `GET /api/evidence?project=<id>` → `{ project: string; records: EvidenceRecord[] }`
**Swap point:** `src/services/EvidenceService.ts`
**Screen at swap time:** `EvidenceLibrary.tsx` gains loading spinner + empty state on error.

---

### 2.4 GuidedReviewService — `/guided-review` screen

```typescript
interface GuidedReviewService {
  getReviewData(): GuidedReviewData; // → async in M5
}

interface GuidedReviewData {
  project: string;
  progress: ReviewProgress;
  currentPaper: ReviewPaper;
  nextPapers: ReviewPaper[];
  excludeReasons: ExcludeReason[];
  previousDecisions: ReviewHistoryEntry[];
}
```

**Backend endpoints (M5):**
- `GET /api/review/current` → `GuidedReviewData`
- `POST /api/review/decide` — records a decision
**Swap point:** `src/services/GuidedReviewService.ts`
**Screen at swap time:** `GuidedReview.tsx` gains paper-load skeleton + decision confirmation via mutation.

---

### 2.5 RecipeService — `/recipes` screen

```typescript
interface RecipeService {
  getRecipes(): Recipe[]; // → async in M5
}
```

**Backend endpoint (M5):** `GET /api/recipes` → `Recipe[]`
**Swap point:** `src/services/RecipeService.ts`
**Screen at swap time:** `RecipeLibrary.tsx` gains loading state.

---

### 2.6 HistoryService — `/history` screen

```typescript
interface HistoryService {
  getRuns(): HistoryRun[]; // → async in M5
}
```

**Backend endpoint (M5):** `GET /api/runs?limit=50` → `HistoryRun[]`
**Swap point:** `src/services/HistoryService.ts`
**Screen at swap time:** `RunHistory.tsx` gains loading state + pagination.

---

### 2.7 ModelsPolicyService — `/models-policy` screen

```typescript
interface ModelsPolicyService {
  getProviders(): PolicyProvider[];                               // → async in M5
  getRoutingOptions(): RoutingPreference[];                       // stays synchronous (enum)
  getRoutingPreferenceLabels(): Record<RoutingPreference, string>; // stays synchronous (enum)
}
```

**Backend endpoint (M5):** `GET /api/policy/providers` → `PolicyProvider[]`
**Swap point:** `src/services/ModelsPolicyService.ts`
**Screen at swap time:** `ModelsPolicy.tsx` gains loading state. Routing option constants stay synchronous.

---

### 2.8 TodayService — `/today` screen

```typescript
interface TodayService {
  getTodayData(): TodayData; // → async in M5
}
```

**Backend endpoint (M5):** `GET /api/workspace/today` → `TodayData`
**Swap point:** `src/services/TodayService.ts`
**Screen at swap time:** `TodayOverview.tsx` gains skeleton cards + partial-load handling.

---

### 2.9 FirstRunService — `/first-run` screen

```typescript
interface FirstRunService {
  getOnboardingConfig(): OnboardingConfig; // stays synchronous (static config)
}
```

**Note:** This config is static application data (step titles, source options). No backend endpoint required; the real client returns the same static bundle at build time.
**Swap point:** `src/services/FirstRunService.ts`
**Screen at swap time:** None — config is static; form submissions will be wired separately when onboarding backend is built.

---

### 2.10 ShellService — ApplicationShell / SidebarNavigation / CommandPalette

```typescript
interface ShellService {
  getShellConfig(): ShellConfig; // stays synchronous (static nav config)
}
```

**Note:** Navigation structure is static application config, not user data. No backend endpoint required.
**Swap point:** `src/services/ShellService.ts`
**Screen at swap time:** None — nav structure is static; dynamic items (e.g., run count badges) will extend `ShellConfig` when added.

---

## 3 — Mock → real swap checklist

When a backend surface is ready for M5 integration:

1. Open `src/services/<SurfaceName>Service.ts`
2. Keep the `interface <SurfaceName>Service` definition unchanged
3. Replace the `mock<SurfaceName>Service` const with a real client implementation that satisfies the interface — the method signatures are identical; only the body changes (from static data to a fetch call)
4. Make the methods `async` — return `Promise<T>` instead of `T`
5. Update the service interface to match (add `Promise<>` wrappers)
6. In the consuming component, add `useState` + `useEffect` (or a data-fetching hook) to call the now-async service, replacing the module-level synchronous call
7. Add loading skeleton and error state to that screen

No other files change. No other screens are affected.

---

## 4 — Import boundary rule

```
src/contracts/   ← imported by: services/, components/, tests/
src/services/    ← imports: contracts/, data/
src/data/        ← imported by: services/ ONLY
src/components/  ← imports: contracts/, services/ (no data/)
src/app/         ← imports: components/ (no data/, no services/ directly)
src/tests/       ← imports: contracts/, services/, components/
```

Enforced by: `grep -r "from.*@/data/" src/components/ src/app/` must return empty.

---

## 5 — Surfaces with no service

| Surface | Why no service |
|---|---|
| `StateGallery` | Internal reference screen; all data is inline UI catalog, not domain data |
| `ProgressBar` | Pure presentational component; utility constants inlined |
| `StatusIndicator` | Pure presentational; `StatusKind` enum inlined |
| `ThemeToggle` | Pure presentational; `THEME_LABELS` inlined |
| `Button`, `RouteProgress` | Zero data dependency |
