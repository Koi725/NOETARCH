"use client";

import { useState, useId } from "react";
import { mockFirstRunService } from "@/services/FirstRunService";
import type { FirstRunFormState, StepNumber } from "./FirstRun_types";

const {
  stepCount: STEP_COUNT,
  steps: firstRunSteps,
  workspaceDefaults,
  researchQuestionDefaults,
  sourceOptions,
  defaultSelectedSources,
  cloudOptions,
  defaultCloudOption,
  spendingLimitDefaults,
  egressOptions,
  egressDefault,
  egressNote,
} = mockFirstRunService.getOnboardingConfig();
import { useScreenTour, FIRST_RUN_TOUR_KEY, FIRST_RUN_TOUR_STEPS } from "@/components/ui";
import "@/tailwind/components/FirstRun/FirstRun.css";

const INITIAL_STATE: FirstRunFormState = {
  workspacePath: workspaceDefaults.defaultPath,
  researchQuestion: "",
  selectedSources: defaultSelectedSources,
  cloudPreference: defaultCloudOption,
  spendingLimit: spendingLimitDefaults.defaultLimit,
  egressPolicy: egressDefault,
};

/* Step 1 — Workspace */
function StepWorkspace({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const step = firstRunSteps.find((s) => s.stepNumber === 1)!;
  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <div className="no-first-run-field">
        <label htmlFor={id} className="no-first-run-field__label">
          Workspace folder path
        </label>
        <input
          id={id}
          type="text"
          className="no-first-run-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`workspace-note-${id}`}
          autoComplete="off"
          spellCheck={false}
        />
        <p className="no-first-run-field__note" id={`workspace-note-${id}`}>
          {workspaceDefaults.note}
        </p>
      </div>
    </div>
  );
}

/* Step 2 — Research question */
function StepQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const step = firstRunSteps.find((s) => s.stepNumber === 2)!;
  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <div className="no-first-run-field">
        <label htmlFor={id} className="no-first-run-field__label">
          Research question
        </label>
        <textarea
          id={id}
          className="no-first-run-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={researchQuestionDefaults.placeholder}
          rows={4}
          aria-describedby={`question-hint-${id}`}
        />
        <p className="no-first-run-field__note" id={`question-hint-${id}`}>
          {researchQuestionDefaults.hint}
        </p>
      </div>
    </div>
  );
}

/* Step 3 — Sources */
function StepSources({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const step = firstRunSteps.find((s) => s.stepNumber === 3)!;

  function toggleSource(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <div
        className="no-first-run-source-list"
        role="group"
        aria-label="Select research sources"
      >
        {sourceOptions.map((src) => {
          const checked = selected.includes(src.id);
          const checkId = `source-${src.id}`;
          return (
            <label
              key={src.id}
              htmlFor={checkId}
              className={`no-first-run-source-row${checked ? " is-checked" : ""}${src.type === "paid" ? " no-first-run-source-row--paid" : ""}`}
            >
              <input
                id={checkId}
                type="checkbox"
                className="no-first-run-checkbox"
                checked={checked}
                onChange={() => toggleSource(src.id)}
              />
              <div className="no-first-run-source-info">
                <span className="no-first-run-source-name">{src.name}</span>
                <span className="no-first-run-source-desc">{src.description}</span>
              </div>
              <span
                className={`no-first-run-source-badge no-first-run-source-badge--${src.type}`}
              >
                {src.type === "paid" ? "Paid — approval required" : "Free"}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* Step 4 — Cloud preference */
function StepCloud({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const step = firstRunSteps.find((s) => s.stepNumber === 4)!;
  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <div
        className="no-first-run-option-list"
        role="radiogroup"
        aria-label="Local or cloud preference"
      >
        {cloudOptions.map((opt) => {
          const radioId = `cloud-${opt.id}`;
          return (
            <label
              key={opt.id}
              htmlFor={radioId}
              className={`no-first-run-option-row${value === opt.id ? " is-selected" : ""}`}
            >
              <input
                id={radioId}
                type="radio"
                name="cloud-preference"
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
                className="no-first-run-radio"
              />
              <div className="no-first-run-option-body">
                <span className="no-first-run-option-label">{opt.label}</span>
                <span className="no-first-run-option-desc">{opt.description}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* Step 5 — Spending limit */
function StepSpending({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const step = firstRunSteps.find((s) => s.stepNumber === 5)!;
  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <div className="no-first-run-field">
        <label htmlFor={id} className="no-first-run-field__label">
          Daily limit (USD)
        </label>
        <div className="no-first-run-cost-row">
          <span className="no-first-run-cost-symbol" aria-hidden="true">$</span>
          <input
            id={id}
            type="number"
            className="no-first-run-cost-input"
            min={0}
            step={0.5}
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onChange(Number.isFinite(v) && v >= 0 ? v : 0);
            }}
            aria-describedby={`spending-note-${id}`}
          />
        </div>
        <p className="no-first-run-field__note" id={`spending-note-${id}`}>
          {spendingLimitDefaults.note}
        </p>
      </div>
    </div>
  );
}

/* Step 6 — Data egress (NO preselection) */
function StepEgress({
  value,
  onChange,
  validationError,
}: {
  value: string | null;
  onChange: (v: string) => void;
  validationError: boolean;
}) {
  const errorId = useId();
  const step = firstRunSteps.find((s) => s.stepNumber === 6)!;
  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <div
        className="no-first-run-option-list"
        role="radiogroup"
        aria-label="Data-egress policy"
        aria-describedby={validationError ? errorId : undefined}
        aria-invalid={validationError ? "true" : undefined}
      >
        {egressOptions.map((opt) => {
          const radioId = `egress-${opt.id}`;
          return (
            <label
              key={opt.id}
              htmlFor={radioId}
              className={`no-first-run-option-row${value === opt.id ? " is-selected" : ""}`}
            >
              <input
                id={radioId}
                type="radio"
                name="egress-policy"
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
                className="no-first-run-radio"
              />
              <div className="no-first-run-option-body">
                <span className="no-first-run-option-label">{opt.label}</span>
                <span className="no-first-run-option-desc">{opt.description}</span>
              </div>
            </label>
          );
        })}
      </div>
      {validationError && (
        <p
          className="no-first-run-validation-error"
          id={errorId}
          role="alert"
          aria-live="assertive"
        >
          Please choose a data-egress policy before continuing.
        </p>
      )}
      <p className="no-first-run-field__note">{egressNote}</p>
    </div>
  );
}

/* Step 7 — Review summary */
function StepReview({
  formState,
  onFinish,
  finished,
}: {
  formState: FirstRunFormState;
  onFinish: () => void;
  finished: boolean;
}) {
  const step = firstRunSteps.find((s) => s.stepNumber === 7)!;
  const selectedSourceNames = sourceOptions
    .filter((s) => formState.selectedSources.includes(s.id))
    .map((s) => s.name);
  const cloudLabel = cloudOptions.find((o) => o.id === formState.cloudPreference)?.label ?? "—";
  const egressLabel = egressOptions.find((o) => o.id === formState.egressPolicy)?.label ?? "—";

  return (
    <div className="no-first-run-step">
      <h2 className="no-first-run-step__title">{step.title}</h2>
      <p className="no-first-run-step__desc">{step.description}</p>
      <dl className="no-first-run-review-list">
        <dt>Workspace</dt>
        <dd>
          <code>{formState.workspacePath || workspaceDefaults.defaultPath}</code>
        </dd>
        <dt>Research question</dt>
        <dd>{formState.researchQuestion || <em>Not entered</em>}</dd>
        <dt>Sources</dt>
        <dd>
          {selectedSourceNames.length > 0 ? selectedSourceNames.join(", ") : <em>None selected</em>}
        </dd>
        <dt>Cloud preference</dt>
        <dd>{cloudLabel}</dd>
        <dt>Daily spending limit</dt>
        <dd>${formState.spendingLimit.toFixed(2)}</dd>
        <dt>Data-egress policy</dt>
        <dd>{egressLabel}</dd>
      </dl>

      {!finished ? (
        <button type="button" className="no-first-run-finish-btn" onClick={onFinish}>
          Finish setup (simulated)
        </button>
      ) : (
        <div
          className="no-first-run-complete-notice"
          role="status"
          aria-live="polite"
        >
          Setup complete · This is a prototype, no data was saved.
        </div>
      )}
    </div>
  );
}

export function FirstRun() {
  useScreenTour(FIRST_RUN_TOUR_KEY, FIRST_RUN_TOUR_STEPS);
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [formState, setFormState] = useState<FirstRunFormState>(INITIAL_STATE);
  const [egressError, setEgressError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [plain, setPlain] = useState(false);
  const plainToggleId = useId();

  function updateField<K extends keyof FirstRunFormState>(key: K, value: FirstRunFormState[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (currentStep === 6 && formState.egressPolicy === null) {
      setEgressError(true);
      return;
    }
    setEgressError(false);
    if (currentStep < STEP_COUNT) {
      setCurrentStep((prev) => (prev + 1) as StepNumber);
    }
  }

  function handlePrev() {
    setEgressError(false);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  }

  function handleFinish() {
    setFinished(true);
  }

  const currentStepData = firstRunSteps.find((s) => s.stepNumber === currentStep)!;

  return (
    <div className="no-first-run-page">
      <header className="no-first-run-page-header">
        <div>
          <div className="no-eyebrow">Setup</div>
          <h1>First-run setup</h1>
        </div>
        <div className="no-first-run-plain-toggle">
          <label htmlFor={plainToggleId} className="no-policy-toggle">
            <input
              id={plainToggleId}
              type="checkbox"
              role="switch"
              checked={plain}
              onChange={() => setPlain((p) => !p)}
              aria-checked={plain}
            />
            <span className="no-policy-toggle__track" aria-hidden="true">
              <span className="no-policy-toggle__thumb" />
            </span>
            <span className="no-policy-toggle__label">Plain-English mode</span>
          </label>
        </div>
      </header>

      {plain && (
        <div className="no-plain-band" role="note">
          <span className="no-plain-mark" aria-hidden="true" />
          <p>
            <strong>In plain words:</strong> this is a setup wizard. You will answer a few
            questions about where to store your files, what you want to research, and how much you
            want to spend. Nothing happens until you press Finish. All choices can be changed later.
          </p>
        </div>
      )}

      <div id="first-run-steps" className="no-first-run-shell">
        {/* Step indicator */}
        <nav
          className="no-first-run-steps-nav"
          aria-label="Setup steps"
        >
          {firstRunSteps.map((step) => (
            <div
              key={step.stepNumber}
              className={`no-first-run-step-dot${currentStep === step.stepNumber ? " is-current" : ""}${currentStep > step.stepNumber ? " is-done" : ""}`}
              aria-current={currentStep === step.stepNumber ? "step" : undefined}
              aria-label={`Step ${step.stepNumber}${currentStep > step.stepNumber ? " — complete" : currentStep === step.stepNumber ? " — current" : ""}`}
            >
              <span className="no-first-run-step-dot__num">{step.stepNumber}</span>
            </div>
          ))}
        </nav>

        <div className="no-first-run-step-label" aria-live="polite" aria-atomic="true">
          Step {currentStep} of {STEP_COUNT} — {currentStepData.title}
        </div>

        <div className="no-first-run-step-content">
          {currentStep === 1 && (
            <StepWorkspace
              value={formState.workspacePath}
              onChange={(v) => updateField("workspacePath", v)}
            />
          )}
          {currentStep === 2 && (
            <StepQuestion
              value={formState.researchQuestion}
              onChange={(v) => updateField("researchQuestion", v)}
            />
          )}
          {currentStep === 3 && (
            <StepSources
              selected={formState.selectedSources}
              onChange={(ids) => updateField("selectedSources", ids)}
            />
          )}
          {currentStep === 4 && (
            <StepCloud
              value={formState.cloudPreference}
              onChange={(v) => updateField("cloudPreference", v)}
            />
          )}
          {currentStep === 5 && (
            <StepSpending
              value={formState.spendingLimit}
              onChange={(v) => updateField("spendingLimit", v)}
            />
          )}
          {currentStep === 6 && (
            <StepEgress
              value={formState.egressPolicy}
              onChange={(v) => {
                updateField("egressPolicy", v);
                setEgressError(false);
              }}
              validationError={egressError}
            />
          )}
          {currentStep === 7 && (
            <StepReview
              formState={formState}
              onFinish={handleFinish}
              finished={finished}
            />
          )}
        </div>

        <div className="no-first-run-nav">
          <button
            type="button"
            className="no-secondary-button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            aria-label="Go to previous step"
          >
            Previous
          </button>
          {currentStep < STEP_COUNT && (
            <button
              type="button"
              className="no-primary-button"
              onClick={handleNext}
              aria-label={`Go to step ${currentStep + 1}`}
            >
              Next
            </button>
          )}
        </div>

        <div className="no-prototype-notice" role="note">
          Prototype · Mock data — no data is saved
        </div>
      </div>
    </div>
  );
}
