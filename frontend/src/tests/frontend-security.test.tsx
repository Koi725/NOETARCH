import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpotlightTour } from "@/components/ui/SpotlightTour";

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const sourceFiles = walk(SRC).filter((f) => !f.includes(`${join("src", "tests")}`));

describe("frontend security invariants (static)", () => {
  test("no dangerouslySetInnerHTML anywhere", () => {
    const offenders = sourceFiles.filter((f) =>
      readFileSync(f, "utf8").includes("dangerouslySetInnerHTML"),
    );
    expect(offenders).toEqual([]);
  });

  test("no eval() or new Function()", () => {
    const offenders = sourceFiles.filter((f) => {
      const s = readFileSync(f, "utf8");
      return /\beval\s*\(/.test(s) || /new\s+Function\s*\(/.test(s);
    });
    expect(offenders).toEqual([]);
  });

  test('any target="_blank" link also sets rel="noopener noreferrer"', () => {
    const offenders = sourceFiles.filter((f) => {
      const s = readFileSync(f, "utf8");
      return s.includes('target="_blank"') && !s.includes("noopener");
    });
    expect(offenders).toEqual([]);
  });

  test("no console.* calls in shipped source", () => {
    const offenders = sourceFiles.filter((f) =>
      /\bconsole\.(log|debug|info|warn|error)\s*\(/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});

describe("untrusted content renders via React escaping only", () => {
  test("a script/HTML-looking string is shown as literal text, not parsed", () => {
    const malicious = '<img src=x onerror="alert(1)"> & <script>bad()</script>';
    render(
      <ThemeProvider>
        <SpotlightTour
          steps={[{ targetId: "none", title: malicious, explanation: malicious }]}
          onClose={() => {}}
        />
      </ThemeProvider>,
    );
    // Rendered as text (React-escaped): the literal string is present…
    expect(screen.getAllByText(malicious).length).toBeGreaterThan(0);
    // …and no actual <img> or <script> element was injected.
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
  });
});
