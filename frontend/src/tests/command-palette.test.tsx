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
    const firstItem = screen.getByRole("button", { name: /Switch to Daylight \(light\)/ });

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

  test("future intentions are disabled and do not navigate", () => {
    const { onClose, onNavigate } = renderPalette();
    const futureIntention = screen.getByRole("button", { name: /Watch the run that's going now/ });
    fireEvent.click(futureIntention);

    expect(futureIntention).toBeDisabled();
    expect(futureIntention).toHaveTextContent("Coming soon");
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("restores focus to the invoking control after close", () => {
    render(<PaletteHarness />);
    const invoker = screen.getByRole("button", { name: "Open intentions" });

    invoker.focus();
    fireEvent.click(invoker);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Switch to Daylight \(light\)/ }));
    fireEvent.click(screen.getByRole("button", { name: "Close command palette" }));

    expect(document.activeElement).toBe(invoker);
  });
});
