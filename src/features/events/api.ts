import { useQuery } from "@tanstack/react-query";
import type { TimeleftEvent } from "./types";

const EVENTS_URL =
  "https://cdn.timeleft.com/frontend-tech-test/events.json";

const fetchEvents = async (): Promise<TimeleftEvent[]> => {
  const res = await fetch(EVENTS_URL);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
};

export const useEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
  });
