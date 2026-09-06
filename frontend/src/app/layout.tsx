import type { Metadata, Viewport } from "next";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOETARCH",
  description: "Local-first research evidence you can defend.",
};

// Explicit responsive viewport (device-width, user-scalable for accessibility zoom).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
