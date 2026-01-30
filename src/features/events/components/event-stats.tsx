"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeleftEvent } from "@/features/events/types";
import {
  CalendarDots,
  Clock,
  Broadcast,
  Archive,
  TrendUp,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { fillRate } from "@/features/events/helpers";

type EventStatsProps = {
  events: TimeleftEvent[] | undefined;
  isLoading: boolean;
};

type StatConfig = {
  label: string;
  key: "total" | "upcoming" | "live" | "past";
  icon: PhosphorIcon;
  accent: string;
  iconBg: string;
  barColor: string;
};

const stats: StatConfig[] = [
  {
    label: "Total Events",
    key: "total",
    icon: CalendarDots,
    accent: "text-foreground",
    iconBg: "bg-foreground/5 dark:bg-foreground/10",
    barColor: "from-foreground/20 to-foreground/5",
  },
  {
    label: "Upcoming",
    key: "upcoming",
    icon: Clock,
    accent: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    barColor: "from-blue-500/30 to-blue-500/5",
  },
  {
    label: "Live Now",
    key: "live",
    icon: Broadcast,
    accent: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    barColor: "from-emerald-500/30 to-emerald-500/5",
  },
  {
    label: "Past",
    key: "past",
    icon: Archive,
    accent: "text-muted-foreground",
    iconBg: "bg-muted dark:bg-muted",
    barColor: "from-muted-foreground/15 to-muted-foreground/5",
  },
];

export const EventStats = ({ events, isLoading }: EventStatsProps) => {
  const counts = {
    total: events?.length ?? 0,
    upcoming: events?.filter((e) => e.status === "upcoming").length ?? 0,
    live: events?.filter((e) => e.status === "live").length ?? 0,
    past: events?.filter((e) => e.status === "past").length ?? 0,
  };

  const avgFill = events?.length
    ? Math.round(
        (events.reduce((sum, e) => sum + fillRate(e), 0) / events.length) * 100
      )
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {stats.map(({ label, key, icon: Icon, accent, iconBg, barColor }, i) => (
        <Card
          key={key}
          className={`group relative overflow-hidden border-border/60 py-0 transition-all duration-300 hover:border-border hover:shadow-md dark:hover:border-border/80 animate-fade-up stagger-${i + 1}`}
        >
          {/* Accent bar at bottom */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${barColor} opacity-0 transition-opacity group-hover:opacity-100`}
          />

          <div className="relative p-4 lg:p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
              <div
                className={`flex size-8 items-center justify-center rounded-lg ${iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className={`size-3.5 ${accent}`} />
              </div>
            </div>

            {/* Number */}
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="flex items-end gap-2">
                <span className={`font-display text-3xl leading-none ${accent}`}>
                  {counts[key].toLocaleString()}
                </span>
                {key === "total" && events && events.length > 0 && (
                  <Badge variant="outline" className="mb-0.5 border-emerald-200 bg-emerald-50 text-[10px] font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <TrendUp className="size-2.5" />
                    {avgFill}% avg fill
                  </Badge>
                )}
                {key === "live" && counts.live > 0 && (
                  <span className="relative mb-1 flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
