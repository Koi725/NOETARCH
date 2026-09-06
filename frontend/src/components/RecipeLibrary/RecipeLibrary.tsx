"use client";

import { useState, useEffect, useId } from "react";
import { fetchRecipes } from "@/services/RecipeService";
import type {
  Recipe,
  CustomRecipe,
  RecipeLibraryProps,
} from "./RecipeLibrary_types";
import { useScreenTour, RecipesSkeleton, RECIPES_TOUR_KEY, RECIPES_TOUR_STEPS } from "@/components/ui";
import "@/tailwind/components/RecipeLibrary/RecipeLibrary.css";

function RecipeCard({
  recipe,
  isExpanded,
  onToggle,
  onDuplicate,
}: {
  recipe: Recipe | CustomRecipe;
  isExpanded: boolean;
  onToggle: () => void;
  onDuplicate: () => void;
}) {
  const panelId = useId();
  const headerId = useId();
  const [customName, setCustomName] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const displayName = customName ?? recipe.name;

  return (
    <article className={`no-recipe-card${isExpanded ? " is-expanded" : ""}`}>
      <button
        type="button"
        className="no-recipe-card__trigger"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        id={headerId}
        onClick={onToggle}
      >
        <span className="no-recipe-card__top">
          <span className="no-recipe-name">{displayName}</span>
          <span
            className={`no-recipe-exec-badge no-recipe-exec-badge--${recipe.execution}`}
            aria-label={`Runs ${recipe.execution === "local" ? "locally on your device" : "in the cloud"}`}
          >
            {recipe.execution === "local" ? "Local" : "Cloud"}
          </span>
        </span>
        <span className="no-recipe-card__summary">
          <span className="no-recipe-desc">{recipe.description}</span>
          <span className="no-recipe-meta">
            <span>{recipe.steps.length} steps</span>
            <span aria-label={`Estimated cost: ${recipe.estimatedCost}`}>
              {recipe.estimatedCost}
            </span>
            <span aria-label={`Estimated time: ${recipe.estimatedTime}`}>
              {recipe.estimatedTime}
            </span>
          </span>
        </span>
      </button>

      {isExpanded && (
        <div
          className="no-recipe-panel"
          id={panelId}
          role="region"
          aria-labelledby={headerId}
        >
          <div className="no-recipe-panel__columns">
            <section aria-label="Steps">
              <h3 className="no-recipe-panel__heading">Steps</h3>
              <ol className="no-recipe-steps">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="no-recipe-step">
                    <span className="no-recipe-step__num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-label="Inputs and outputs">
              <h3 className="no-recipe-panel__heading">Inputs</h3>
              <ul className="no-recipe-io-list">
                {recipe.inputs.map((inp, i) => (
                  <li key={i}>{inp}</li>
                ))}
              </ul>
              <h3 className="no-recipe-panel__heading">Outputs</h3>
              <ul className="no-recipe-io-list">
                {recipe.outputs.map((out, i) => (
                  <li key={i} className="no-recipe-output">
                    {out}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Providers and privacy">
              <h3 className="no-recipe-panel__heading">Providers</h3>
              <ul className="no-recipe-io-list">
                {recipe.providers.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <h3 className="no-recipe-panel__heading">Privacy</h3>
              <p className="no-recipe-privacy">{recipe.privacyPolicy}</p>
            </section>
          </div>

          <div className="no-recipe-panel__actions">
            <button
              type="button"
              className="no-recipe-action-btn no-recipe-action-btn--duplicate"
              onClick={onDuplicate}
            >
              Duplicate
            </button>
            {!editingName ? (
              <button
                type="button"
                className="no-recipe-action-btn no-recipe-action-btn--customize"
                onClick={() => {
                  setNameInput(displayName);
                  setEditingName(true);
                }}
              >
                Customize name
              </button>
            ) : (
              <div className="no-recipe-name-edit" role="form" aria-label="Customize recipe name">
                <label className="no-recipe-name-label" htmlFor={`name-input-${recipe.id}`}>
                  Recipe name
                </label>
                <input
                  id={`name-input-${recipe.id}`}
                  type="text"
                  className="no-recipe-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="no-recipe-action-btn no-recipe-action-btn--save"
                  onClick={() => {
                    if (nameInput.trim()) setCustomName(nameInput.trim());
                    setEditingName(false);
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="no-recipe-action-btn"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function RecipeLibrary({ recipes: recipesProp }: RecipeLibraryProps) {
  useScreenTour(RECIPES_TOUR_KEY, RECIPES_TOUR_STEPS);
  const [recipes, setRecipes] = useState<Recipe[] | null>(recipesProp ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipesProp) return;
    let cancelled = false;
    fetchRecipes()
      .then((data) => {
        if (!cancelled) setRecipes(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load recipes.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [recipesProp]);

  if (error) {
    return (
      <main className="no-recipe-library" aria-label="Recipe library">
        <div role="alert" className="no-recipe-error">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!recipes) {
    return (
      <main className="no-recipe-library" aria-label="Recipe library">
        <div role="status" aria-label="Loading recipes">
          <RecipesSkeleton />
        </div>
      </main>
    );
  }

  return <RecipeLibraryView recipes={recipes} />;
}

function RecipeLibraryView({ recipes }: { recipes: Recipe[] }) {
  const effectiveRecipes = recipes;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [toastId, setToastId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (id: string, msg: string) => {
    setToastId(id);
    setToastMessage(msg);
    setTimeout(() => setToastId(null), 3000);
  };

  const handleDuplicate = (recipe: Recipe | CustomRecipe) => {
    const copy: CustomRecipe = {
      ...recipe,
      id: `${recipe.id}-copy-${customRecipes.length + 1}`,
      originalId: recipe.id,
      name: `${recipe.name} (copy)`,
      customName: `${recipe.name} (copy)`,
    };
    setCustomRecipes((prev) => [...prev, copy]);
    showToast(copy.id, `"${copy.name}" added to your recipes`);
  };

  const allRecipes: Array<Recipe | CustomRecipe> = [...effectiveRecipes, ...customRecipes];

  return (
    <main className="no-recipe-library" aria-label="Recipe library">
      <header className="no-page-header">
        <h1 id="recipes-header" className="no-page-title">Recipes · Save time with reusable workflows</h1>
        <p className="no-prototype-notice" role="note">
          Simulated · no backend
        </p>
      </header>

      <div
        className="no-recipe-toast-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toastId && (
          <div className="no-recipe-toast">
            Duplicated! {toastMessage}
          </div>
        )}
      </div>

      <div id="recipes-grid" className="no-recipe-grid">
        {allRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isExpanded={expandedId === recipe.id}
            onToggle={() =>
              setExpandedId(expandedId === recipe.id ? null : recipe.id)
            }
            onDuplicate={() => handleDuplicate(recipe)}
          />
        ))}
      </div>
    </main>
  );
}
