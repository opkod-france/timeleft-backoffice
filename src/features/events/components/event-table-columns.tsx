"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TimeleftEvent, EventStatus } from "@/features/events/types";
import { fillRate, statusLabel } from "@/features/events/helpers";

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

const SortableHeader = ({
  column,
  label,
}: {
  column: { getIsSorted: () => false | "asc" | "desc"; getToggleSortingHandler: () => ((event: unknown) => void) | undefined };
  label: string;
}) => {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      <Icon className="ml-1 size-3.5" />
    </Button>
  );
};

export const columns: ColumnDef<TimeleftEvent>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("type")}</span>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") as string);
      return (
        <div className="flex flex-col">
          <span className="text-sm">{format(date, "MMM d, yyyy")}</span>
          <span className="text-muted-foreground text-xs">
            {format(date, "HH:mm")}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.getValue("date") as string).getTime();
      const b = new Date(rowB.getValue("date") as string).getTime();
      return a - b;
    },
  },
  {
    id: "location",
    accessorFn: (row) =>
      `${row.zone.city.name}, ${row.zone.name}`,
    header: "Location",
    cell: ({ row }) => {
      const { zone } = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm">{zone.city.name}</span>
          <span className="text-muted-foreground text-xs">
            {zone.name} &middot; {zone.city.country.name}
          </span>
        </div>
      );
    },
  },
  {
    id: "capacity",
    accessorFn: (row) => row.booked,
    header: ({ column }) => (
      <SortableHeader column={column} label="Booked" />
    ),
    cell: ({ row }) => {
      const { booked, capacity } = row.original;
      const rate = fillRate(row.original);
      const pct = Math.round(rate * 100);
      const barColor =
        pct >= 90
          ? "bg-emerald-500"
          : pct >= 70
            ? "bg-amber-500"
            : "bg-blue-500";

      return (
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex justify-between text-xs tabular-nums">
              <span>
                {booked}/{capacity}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = fillRate(rowA.original);
      const b = fillRate(rowB.original);
      return a - b;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} label="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as EventStatus;
      const config = statusConfig[status];
      return (
        <Badge variant={config.variant} className={config.className}>
          {statusLabel[status]}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const order: Record<EventStatus, number> = {
        live: 0,
        upcoming: 1,
        past: 2,
      };
      return (
        order[rowA.getValue("status") as EventStatus] -
        order[rowB.getValue("status") as EventStatus]
      );
    },
  },
];
