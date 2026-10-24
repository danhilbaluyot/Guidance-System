import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guidance Office Visit Log",
  description: "Paperless check-in and records for the school guidance office.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface text-text">
        {children}
      </body>
    </html>
  );
}
