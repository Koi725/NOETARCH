import { ApplicationShell } from "@/components/ApplicationShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ApplicationShell>{children}</ApplicationShell>
    </ThemeProvider>
  );
}
