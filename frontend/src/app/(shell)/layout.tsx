import { ApplicationShell } from "@/components/ApplicationShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingGate>
        <ApplicationShell>{children}</ApplicationShell>
      </OnboardingGate>
    </ThemeProvider>
  );
}
