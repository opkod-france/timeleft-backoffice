"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeleftEvent } from "@/features/events/types";
import { CalendarDays, Radio, Clock, Archive } from "lucide-react";

type EventStatsProps = {
  events: TimeleftEvent[] | undefined;
  isLoading: boolean;
};

const stats = [
  {
    label: "Total Events",
    key: "total" as const,
    icon: CalendarDays,
    color: "text-foreground",
  },
  {
    label: "Upcoming",
    key: "upcoming" as const,
    icon: Clock,
    color: "text-blue-600",
  },
  {
    label: "Live",
    key: "live" as const,
    icon: Radio,
    color: "text-emerald-600",
  },
  {
    label: "Past",
    key: "past" as const,
    icon: Archive,
    color: "text-muted-foreground",
  },
] as const;

export const EventStats = ({ events, isLoading }: EventStatsProps) => {
  const counts = {
    total: events?.length ?? 0,
    upcoming: events?.filter((e) => e.status === "upcoming").length ?? 0,
    live: events?.filter((e) => e.status === "live").length ?? 0,
    past: events?.filter((e) => e.status === "past").length ?? 0,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, key, icon: Icon, color }) => (
        <Card key={key} className="gap-0 py-4">
          <CardHeader className="gap-0 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
              </CardTitle>
              <Icon className={`size-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-2xl font-semibold tabular-nums ${color}`}>
                {counts[key].toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
