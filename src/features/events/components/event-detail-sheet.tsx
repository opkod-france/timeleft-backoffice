"use client";

import { useQueryState } from "nuqs";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Clock, Hash } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { eventsSearchParams } from "@/features/events/search-params";
import {
  fillRate,
  statusLabel,
  statusConfig,
  categoryConfig,
} from "@/features/events/helpers";
import type { TimeleftEvent, EventCategory } from "@/features/events/types";

type EventDetailSheetProps = {
  events: TimeleftEvent[] | undefined;
};

export const EventDetailSheet = ({ events }: EventDetailSheetProps) => {
  const [eventId, setEventId] = useQueryState(
    "event",
    eventsSearchParams.event
  );

  const event = events?.find((e) => e.id === eventId);
  const isOpen = eventId !== "" && !!event;

  const handleOpenChange = (open: boolean) => {
    if (!open) setEventId(null);
  };

  if (!event) return null;

  const date = new Date(event.date);
  const rate = fillRate(event);
  const pct = Math.round(rate * 100);
  const sConfig = statusConfig[event.status];
  const remaining = event.capacity - event.booked;

  const type = event.type.toLowerCase() as EventCategory;
  const catConfig = categoryConfig[type];
  const CatIcon = catConfig?.icon;

  const barColor =
    pct >= 90
      ? "bg-emerald-500 dark:bg-emerald-400"
      : pct >= 70
        ? "bg-amber-500 dark:bg-amber-400"
        : "bg-blue-500 dark:bg-blue-400";

  // Category-specific accent colors for the header strip
  const accentGradient =
    type === "dinner"
      ? "from-amber-500/20 via-amber-400/5 to-transparent dark:from-amber-500/10 dark:via-amber-400/5"
      : type === "drink"
        ? "from-violet-500/20 via-violet-400/5 to-transparent dark:from-violet-500/10 dark:via-violet-400/5"
        : "from-emerald-500/20 via-emerald-400/5 to-transparent dark:from-emerald-500/10 dark:via-emerald-400/5";

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md border-border/50 p-0 dark:border-border dark:bg-card">
        {/* Category accent gradient strip */}
        <div
          className={`h-24 bg-gradient-to-b ${accentGradient} pointer-events-none absolute inset-x-0 top-0 z-0`}
        />

        {/* Header */}
        <SheetHeader className="relative z-10 px-5 pt-5 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              {/* Category badge + Status */}
              <div className="flex items-center gap-2">
                {catConfig && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-wider ${catConfig.className}`}
                  >
                    <CatIcon className="size-3" />
                    {catConfig.label}
                  </Badge>
                )}
                <Badge variant={sConfig.variant} className={sConfig.className}>
                  {event.status === "live" && (
                    <span className="relative mr-1 flex size-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                    </span>
                  )}
                  {statusLabel[event.status]}
                </Badge>
              </div>

              <SheetTitle className="font-display text-xl leading-tight flex items-center gap-1.5">
                <MapPin className="size-5 text-muted-foreground/60 shrink-0" />
                {event.zone.city.name}
                <span className="text-muted-foreground font-normal">
                  &middot; {event.zone.name}
                </span>
              </SheetTitle>
            </div>
          </div>

          <SheetDescription className="sr-only">
            Event details for {event.type} in {event.zone.city.name}
          </SheetDescription>
        </SheetHeader>

        <div className="relative z-10 flex flex-col gap-5 px-5 pt-4 pb-6">
          {/* Capacity card — promoted to primary position */}
          <div className="rounded-xl border border-border/60 bg-card p-4 dark:bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Capacity
              </span>
            </div>

            <div className="flex items-end justify-between mb-2.5">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl leading-none">
                  {event.booked}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {event.capacity}
                </span>
              </div>
              <span className="font-data text-sm text-muted-foreground">
                {pct}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className={`size-1.5 rounded-full ${
                  remaining > 0 ? "bg-emerald-500" : "bg-muted-foreground/40"
                }`}
              />
              {remaining > 0
                ? `${remaining} spot${remaining !== 1 ? "s" : ""} remaining`
                : "Fully booked"}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-card/50 p-3 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Date
                </span>
              </div>
              <span className="text-sm font-medium leading-snug">
                {format(date, "MMM d, yyyy")}
              </span>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-card/50 p-3 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Time
                </span>
              </div>
              <span className="font-data text-sm font-medium">
                {format(date, "HH:mm")}
              </span>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-card/50 p-3 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Country
                </span>
              </div>
              <span className="text-sm font-medium">
                {event.zone.city.country.name}
              </span>
            </div>

            {/* Event ID */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-card/50 p-3 dark:bg-muted/10">
              <div className="flex items-center gap-1.5">
                <Hash className="size-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Event ID
                </span>
              </div>
              <span className="font-data text-xs text-muted-foreground truncate">
                {event.id}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
