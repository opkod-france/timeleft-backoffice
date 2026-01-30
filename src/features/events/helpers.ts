import type { EventStatus, TimeleftEvent } from "./types";

export const fillRate = (event: TimeleftEvent): number =>
  event.capacity > 0 ? event.booked / event.capacity : 0;

export const statusLabel: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  past: "Past",
};

export const STATUS_OPTIONS: EventStatus[] = ["upcoming", "live", "past"];
