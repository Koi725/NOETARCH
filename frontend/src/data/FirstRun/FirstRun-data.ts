export interface FirstRunSource {
  id: string;
  name: string;
  type: "free" | "paid";
  description: string;
}

export interface FirstRunCloudOption {
  id: string;
  label: string;
  description: string;
}

export interface FirstRunEgressOption {
  id: string;
  label: string;
  description: string;
}

export interface FirstRunStep {
  stepNumber: number;
  title: string;
  description: string;
}

export const STEP_COUNT = 7;

export const firstRunSteps: FirstRunStep[] = [
  { stepNumber: 1, title: "Where should NOETARCH store your work?", description: "NOETARCH creates one folder for each research project. All files stay on your device unless you approve a cloud step." },
  { stepNumber: 2, title: "What are you investigating?", description: "Write your research question in plain English. NOETARCH will generate search strategies automatically." },
  { stepNumber: 3, title: "Which sources should we search?", description: "NOETARCH will query the sources you select. Free sources run immediately; paid sources need your approval at each use." },
  { stepNumber: 4, title: "How do you prefer to run your research?", description: "You can change this decision per-step when running a workflow." },
  { stepNumber: 5, title: "What's your daily spending limit?", description: "NOETARCH stops and asks before exceeding this limit. Set $0 to require approval for every cloud action." },
  { stepNumber: 6, title: "What should leave your device?", description: "Cloud AI services receive the text you send them. Choose when this is allowed." },
  { stepNumber: 7, title: "Ready to start", description: "Here's what you've set up. You can change any of these later." },
];

export const workspaceDefaults = {
  defaultPath: "~/NOETARCH",
  note: "You can change this at any time in Settings.",
};

export const researchQuestionDefaults = {
  placeholder: "e.g., How do remote work policies affect employee well-being in knowledge-intensive firms?",
  hint: "Be specific about the population, the intervention or change, and the outcome you care about.",
};

export const sourceOptions: FirstRunSource[] = [
  { id: "openalex", name: "OpenAlex", type: "free", description: "~250M scholarly works, open access" },
  { id: "crossref", name: "Crossref", type: "free", description: "DOI metadata for ~150M publications" },
  { id: "semantic-scholar", name: "Semantic Scholar", type: "free", description: "AI-powered paper search, ~200M papers" },
  { id: "pubmed", name: "PubMed", type: "free", description: "Biomedical literature, 35M+ citations" },
  { id: "anthropic", name: "Anthropic (screening)", type: "paid", description: "AI abstract screening, $0.01–$0.10 per 100 papers" },
];

export const defaultSelectedSources = ["openalex", "crossref"];

export const cloudOptions: FirstRunCloudOption[] = [
  {
    id: "prefer-local",
    label: "Prefer local — use cloud only when I approve",
    description: "Safest for sensitive topics. Some steps may take longer.",
  },
  {
    id: "allow-cloud",
    label: "Allow cloud steps — ask me before each cloud action",
    description: "Faster results. You still approve each cloud step individually.",
  },
];

export const defaultCloudOption = "prefer-local";

export const spendingLimitDefaults = {
  defaultLimit: 2.0,
  note: "This is a local guardrail — NOETARCH will not charge you. You control your API keys.",
};

export const egressOptions: FirstRunEgressOption[] = [
  {
    id: "explicit",
    label: "Always ask before sending data to the cloud",
    description: "You see exactly what will be sent and approve each request.",
  },
  {
    id: "category",
    label: "Ask when the type of data changes",
    description: "Approve once per data type (e.g., first time abstracts are sent).",
  },
];

// egressDefault is intentionally null — no preselection
export const egressDefault: string | null = null;

export const egressNote = "You can change this later in Models & policy.";
