import { Suspense } from "react";
import { EventTable } from "@/features/events/components/event-table";

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and monitor all events across locations.
        </p>
      </div>
      <Suspense>
        <EventTable />
      </Suspense>
    </main>
  );
}
