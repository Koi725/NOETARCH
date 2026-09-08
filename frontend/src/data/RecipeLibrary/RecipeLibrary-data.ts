import type { Recipe } from "@/components/RecipeLibrary/RecipeLibrary_types";

export const recipes: Recipe[] = [
  {
    id: "rec-001",
    name: "Quick literature scan",
    description:
      "Find and deduplicate papers from OpenAlex and Crossref for a research question. Runs entirely on your device.",
    execution: "local",
    steps: [
      "Generate search queries (on-device)",
      "Query OpenAlex",
      "Query Crossref",
      "Deduplicate results",
      "Export CSV",
    ],
    inputs: ["Research question", "Date range", "Max papers (default: 500)"],
    outputs: ["evidence.candidates.csv", "search-strategy.md"],
    estimatedCost: "$0.00",
    estimatedTime: "3–8 minutes",
    providers: ["On-device model", "OpenAlex (free)", "Crossref (free)"],
    privacyPolicy:
      "All data stays on your device. No information leaves your network.",
    prefill: { maxResults: 100 },
  },
  {
    id: "rec-002",
    name: "Full systematic review",
    description:
      "Complete PRISMA-compatible systematic review with cloud-assisted screening. Requires Anthropic API key.",
    execution: "cloud",
    steps: [
      "Generate search queries (on-device)",
      "Query 3 sources",
      "Deduplicate",
      "Abstract screening (Anthropic)",
      "Full-text retrieval",
      "Evidence scoring (Anthropic)",
      "Export with provenance",
    ],
    inputs: [
      "Research question",
      "PICO criteria",
      "Date range",
      "Anthropic API key",
    ],
    outputs: [
      "evidence.xlsx",
      "prisma-flowchart.md",
      "review.bib",
      "provenance.json",
    ],
    estimatedCost: "$1.50–$4.00",
    estimatedTime: "15–45 minutes",
    providers: [
      "On-device model",
      "OpenAlex (free)",
      "Crossref (free)",
      "Semantic Scholar (free)",
      "Anthropic Claude (paid)",
    ],
    privacyPolicy:
      "Abstract text is sent to Anthropic for screening. You approve this at step 4.",
    prefill: { maxResults: 100, budgetUsd: 4 },
  },
  {
    id: "rec-003",
    name: "Author network analysis",
    description:
      "Build a co-authorship network from an existing paper set.",
    execution: "local",
    steps: [
      "Load paper records",
      "Extract author lists",
      "Build co-authorship graph",
      "Calculate centrality",
      "Export graph data",
    ],
    inputs: ["evidence.candidates.csv or evidence.xlsx"],
    outputs: ["author-network.json", "network-stats.csv"],
    estimatedCost: "$0.00",
    estimatedTime: "< 1 minute",
    providers: ["On-device model"],
    privacyPolicy: "All data stays on your device.",
  },
  {
    id: "rec-004",
    name: "Evidence synthesis",
    description:
      "Generate a draft synthesis of included evidence with source citations.",
    execution: "cloud",
    steps: [
      "Load included papers",
      "Cluster by theme (on-device)",
      "Draft synthesis per cluster (Anthropic)",
      "Assemble with citations",
      "Export",
    ],
    inputs: ["Reviewed evidence set (included papers only)"],
    outputs: ["synthesis-draft.md", "citations.bib"],
    estimatedCost: "$0.80–$2.50",
    estimatedTime: "5–15 minutes",
    providers: ["On-device model", "Anthropic Claude (paid)"],
    privacyPolicy:
      "Included paper abstracts and titles are sent to Anthropic. You review and approve before the step runs.",
  },
];
