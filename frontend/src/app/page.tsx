import { ApplicationShell } from "@/components/ApplicationShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Page() {
  return (
    <ThemeProvider>
      <ApplicationShell />
    </ThemeProvider>
  );
}
