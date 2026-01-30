"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowsDownUp, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TimeleftEvent, EventStatus, EventCategory } from "@/features/events/types";
import { fillRate, statusLabel, statusConfig, categoryConfig } from "@/features/events/helpers";

const SortableHeader = ({
  column,
  label,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
  };
  label: string;
}) => {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowsDownUp;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-7 cursor-pointer gap-1 text-[11px] font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      <Icon
        className={`size-3 ${sorted ? "text-brand-pink" : "text-muted-foreground/40"}`}
      />
    </Button>
  );
};

export const columns: ColumnDef<TimeleftEvent>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = (row.getValue("type") as string).toLowerCase() as EventCategory;
      const config = categoryConfig[type];
      if (!config) return <span className="text-sm font-medium">{row.getValue("type")}</span>;
      const Icon = config.icon;
      return (
        <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
          <Icon className="size-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") as string);
      return (
        <div className="flex flex-col">
          <span className="text-sm">{format(date, "MMM d, yyyy")}</span>
          <span className="font-data text-xs text-muted-foreground">
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
    accessorFn: (row) => `${row.zone.city.name}, ${row.zone.name}`,
    header: "Location",
    cell: ({ row }) => {
      const { zone } = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{zone.city.name}</span>
          <span className="text-xs text-muted-foreground">
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
          ? "bg-emerald-500 dark:bg-emerald-400"
          : pct >= 70
            ? "bg-amber-500 dark:bg-amber-400"
            : "bg-blue-500 dark:bg-blue-400";

      return (
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex justify-between text-xs">
              <span className="font-data">
                {booked}/{capacity}
              </span>
              <span className="font-data text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/60 dark:bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
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
          {status === "live" && (
            <span className="relative mr-1 flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-current" />
            </span>
          )}
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
