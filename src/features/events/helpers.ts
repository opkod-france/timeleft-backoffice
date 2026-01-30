import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { ForkKnife, Wine, PersonSimpleRun } from "@phosphor-icons/react";
import type { EventStatus, EventCategory, TimeleftEvent } from "./types";

export const fillRate = (event: TimeleftEvent): number =>
  event.capacity > 0 ? event.booked / event.capacity : 0;

export const statusLabel: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  past: "Past",
};

export const STATUS_OPTIONS: EventStatus[] = ["upcoming", "live", "past"];

export const statusConfig: Record<
  EventStatus,
  { variant: "outline" | "default" | "secondary"; className: string }
> = {
  upcoming: {
    variant: "outline",
    className:
      "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-500/30 dark:text-blue-300 dark:bg-blue-500/10",
  },
  live: {
    variant: "default",
    className:
      "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500",
  },
  past: {
    variant: "secondary",
    className: "text-muted-foreground",
  },
};

export const categoryConfig: Record<
  EventCategory,
  { label: string; icon: PhosphorIcon; className: string }
> = {
  dinner: {
    label: "DINNER",
    icon: ForkKnife,
    className:
      "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:bg-amber-500/10",
  },
  drink: {
    label: "DRINK",
    icon: Wine,
    className:
      "border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:bg-violet-500/10",
  },
  run: {
    label: "RUN",
    icon: PersonSimpleRun,
    className:
      "border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:bg-emerald-500/10",
  },
};
