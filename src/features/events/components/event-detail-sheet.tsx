"use client";

import { useQueryState } from "nuqs";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Tag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { eventsSearchParams } from "@/features/events/search-params";
import { fillRate, statusLabel } from "@/features/events/helpers";
import type { TimeleftEvent, EventStatus } from "@/features/events/types";

const statusConfig: Record<
  EventStatus,
  { variant: "outline" | "default" | "secondary"; className: string }
> = {
  upcoming: {
    variant: "outline",
    className: "border-blue-200 text-blue-700 bg-blue-50",
  },
  live: {
    variant: "default",
    className: "bg-emerald-600 text-white border-emerald-600",
  },
  past: {
    variant: "secondary",
    className: "",
  },
};

type EventDetailSheetProps = {
  events: TimeleftEvent[] | undefined;
};

const DetailRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-3">
    <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  </div>
);

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
  const config = statusConfig[event.status];
  const barColor =
    pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-500";

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg">{event.type}</SheetTitle>
            <Badge variant={config.variant} className={config.className}>
              {statusLabel[event.status]}
            </Badge>
          </div>
          <SheetDescription>{event.id}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <Separator />

          <div className="flex flex-col gap-5">
            <DetailRow icon={Calendar} label="Date & Time">
              <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
              <span className="text-muted-foreground ml-1">
                at {format(date, "HH:mm")}
              </span>
            </DetailRow>

            <DetailRow icon={MapPin} label="Location">
              <span className="font-medium">{event.zone.city.name}</span>
              <span className="text-muted-foreground">
                {" "}
                &middot; {event.zone.name}
              </span>
              <div className="text-muted-foreground text-xs">
                {event.zone.city.country.name}
              </div>
            </DetailRow>

            <DetailRow icon={Tag} label="Event Type">
              {event.type}
            </DetailRow>

            <DetailRow icon={Users} label="Capacity">
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex justify-between tabular-nums">
                  <span>
                    {event.booked} / {event.capacity} booked
                  </span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-muted-foreground text-xs">
                  {event.capacity - event.booked} spots remaining
                </div>
              </div>
            </DetailRow>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
