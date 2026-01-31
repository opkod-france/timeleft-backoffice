"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { setAuthenticated } from "@/components/protected-route";
import { CalendarDots, SignOut } from "@phosphor-icons/react";

export function AppHeader() {
  const router = useRouter();

  const handleLogout = () => {
    setAuthenticated(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src="https://timeleft.com/fr/wp-content/uploads/sites/6/2023/08/logo_black.svg"
              alt="Timeleft"
              className="h-6 dark:brightness-0 dark:invert"
            />
            <span className="hidden rounded-full bg-muted px-2 py-0.5 text-2xs font-medium text-muted-foreground sm:inline">
              Back Office
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="/events"
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-foreground transition-colors"
            >
              <CalendarDots className="size-3.5" />
              Events
            </a>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="cursor-pointer flex size-9 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-all hover:border-destructive/30 hover:text-destructive glow-hover-destructive"
            aria-label="Sign out"
          >
            <SignOut className="size-4" />
          </button>
          <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-brand-pink to-brand-pink/70 text-xs font-semibold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
