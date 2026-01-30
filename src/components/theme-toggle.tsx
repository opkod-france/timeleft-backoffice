"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer group relative flex size-9 items-center justify-center rounded-full border border-border/60 bg-card transition-all duration-300 hover:border-brand-pink/40 hover:shadow-[0_0_12px_-2px] hover:shadow-brand-pink/20"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun className="size-4 rotate-0 scale-100 text-foreground/80 transition-all duration-300 group-hover:text-brand-pink dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 text-foreground/80 transition-all duration-300 group-hover:text-brand-pink dark:rotate-0 dark:scale-100" />
    </button>
  );
}
