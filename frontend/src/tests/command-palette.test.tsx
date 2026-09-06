import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeProvider } from "@/components/ThemeProvider";

function renderPalette(onClose = vi.fn(), onNavigate = vi.fn()) {
  return {
    onClose,
    onNavigate,
    ...render(
      <ThemeProvider>
        <CommandPalette open onClose={onClose} onNavigate={onNavigate} />
      </ThemeProvider>,
    ),
  };
}

function PaletteHarness() {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider>
      <button type="button" onClick={() => setOpen(true)}>Open intentions</button>
      <CommandPalette open={open} onClose={() => setOpen(false)} onNavigate={vi.fn()} />
    </ThemeProvider>
  );
}

describe("command palette", () => {
  test("focuses the first intention and closes on Escape", () => {
    const { onClose } = renderPalette();
    const dialog = screen.getByRole("dialog", { name: "Type what you want to do" });
    // In M3, all items are available — the first item is "Decide the two things waiting for me"
    const firstItem = screen.getByRole("button", { name: /Decide the two things waiting for me/ });

    expect(document.activeElement).toBe(firstItem);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("theme intention changes the persisted theme and closes the palette", async () => {
    const { onClose, onNavigate } = renderPalette();
    fireEvent.click(screen.getByRole("button", { name: /Switch to Daylight \(light\)/ }));

    await waitFor(() => {
      expect(document.documentElement.dataset.mode).toBe("day");
      expect(window.localStorage.getItem("noetarch.mode")).toBe("day");
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("navigation intentions invoke onNavigate with the correct href", () => {
    const { onNavigate } = renderPalette();
    const decisionsItem = screen.getByRole("button", { name: /Decide the two things waiting for me/ });

    expect(decisionsItem).not.toBeDisabled();
    fireEvent.click(decisionsItem);
    expect(onNavigate).toHaveBeenCalledWith("/decisions");
  });

  test("all M3 palette items are enabled", () => {
    renderPalette();
    const palette = screen.getByRole("dialog");
    const disabledButtons = palette.querySelectorAll("button:disabled");
    expect(disabledButtons).toHaveLength(0);
  });

  test("restores focus to the invoking control after close", () => {
    render(<PaletteHarness />);
    const invoker = screen.getByRole("button", { name: "Open intentions" });

    invoker.focus();
    fireEvent.click(invoker);
    // First enabled item in M3 is "Decide the two things waiting for me"
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Decide the two things waiting for me/ }));
    fireEvent.click(screen.getByRole("button", { name: "Close command palette" }));

    expect(document.activeElement).toBe(invoker);
  });
});
