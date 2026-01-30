import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timeleft Back Office",
  description: "Internal operations dashboard for Timeleft events",
};

const themeScript = `(function(){try{var t=localStorage.getItem("timeleft-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <QueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
