# Frontend Security Review (M11 close-out)

**Scope:** the Next.js frontend (`frontend/src/**`). Reviewed at the final frontend
milestone. Focus: untrusted external content (OpenAlex/Crossref), injection sinks, secrets
in the bundle, external links, storage, and console hygiene.

**Result:** clean. No fixes were required; findings are asserted by automated tests
(`src/tests/frontend-security.test.tsx`) so regressions are caught in CI.

## Findings

| Check | Result | Evidence |
|---|---|---|
| `dangerouslySetInnerHTML` | **None** | static scan test + repo grep |
| `eval()` / `new Function()` | **None** | static scan test |
| Untrusted text rendering | **React escaping only** | All OpenAlex/Crossref values (titles, author names, journal, DOI, abstracts) render as JSX `{value}` text nodes — never as HTML. A render test injects a `<img onerror>`/`<script>` string and confirms it appears as literal text with no element created. |
| Secrets / API keys in bundle | **None** | The only client env var is `NEXT_PUBLIC_API_BASE` (a base URL, intentionally public). OpenAlex/Crossref are keyless; the backend reads any credentials from the server environment (M9). No secret is referenced in `frontend/src`. |
| External links (`target="_blank"`) | **None present**; guard in place | No `target="_blank"` anchors exist. A test fails if one is ever added without `rel="noopener noreferrer"`. |
| `localStorage` access | **Guarded** | Only via `ThemeProvider` and the tour helpers (`components/ui/tour-storage.ts`), each wrapped in try/catch so blocked/unavailable storage never breaks rendering. |
| `console.*` in shipped source | **None** | static scan test |

## Defense-in-depth notes

- Untrusted provider text is additionally **length-truncated and validated server-side**
  (strict Pydantic with `extra="ignore"`, M9) before it ever reaches the client, and is
  stored via parameterized DB writes — the client is the last line, not the only one.
- The tour/tooltip kit renders only React text nodes and inline style objects (numeric
  positions) — no HTML strings, no user-derived class/attribute injection.
- The spotlight overlay never `aria-hide`s the app and never parses HTML.

## Tests guarding these invariants

`src/tests/frontend-security.test.tsx`:
- static scans of all shipped `.ts`/`.tsx` for `dangerouslySetInnerHTML`, `eval`/`new
  Function`, unguarded `target="_blank"`, and `console.*`;
- a render test proving React escapes a script/HTML-looking string.
