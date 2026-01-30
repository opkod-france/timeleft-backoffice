"use client";

import { Suspense } from "react";
import { EventTable } from "@/features/events/components/event-table";
import { AppHeader } from "@/components/app-header";
import { ProtectedRoute } from "@/components/protected-route";

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 animate-fade-up">
            <h1 className="font-display text-2xl text-display">Events</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and monitor all events across locations.
            </p>
          </div>
          <Suspense>
            <EventTable />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
