"use client";

import { useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useQueryStates, useQueryState } from "nuqs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/features/events/api";
import { eventsSearchParams } from "@/features/events/search-params";
import { columns } from "./event-table-columns";
import { EventStats } from "./event-stats";
import { EventTableToolbar } from "./event-table-toolbar";
import { EventTablePagination } from "./event-table-pagination";
import { EventDetailSheet } from "./event-detail-sheet";
import type { TimeleftEvent, EventCategory } from "@/features/events/types";
import { ArrowsClockwise } from "@phosphor-icons/react";

export const EventTable = () => {
  const { data: events, isLoading, isError, refetch } = useEvents();

  const [
    { page, perPage, sort, order, status, search, dateFrom, dateTo, types },
    setParams,
  ] = useQueryStates(
    {
      page: eventsSearchParams.page,
      perPage: eventsSearchParams.perPage,
      sort: eventsSearchParams.sort,
      order: eventsSearchParams.order,
      status: eventsSearchParams.status,
      search: eventsSearchParams.search,
      dateFrom: eventsSearchParams.dateFrom,
      dateTo: eventsSearchParams.dateTo,
      types: eventsSearchParams.types,
    },
    { shallow: false }
  );

  const [, setEventId] = useQueryState("event", eventsSearchParams.event);

  const filteredData = useMemo(() => {
    if (!events) return [];

    let result = events;

    if (status) {
      result = result.filter((e) => e.status === status);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.type.toLowerCase().includes(term) ||
          e.zone.city.name.toLowerCase().includes(term) ||
          e.zone.city.country.name.toLowerCase().includes(term) ||
          e.zone.name.toLowerCase().includes(term)
      );
    }

    if (dateFrom) {
      result = result.filter((e) => new Date(e.date) >= dateFrom);
    }

    if (dateTo) {
      const endOfTo = new Date(dateTo);
      endOfTo.setHours(23, 59, 59, 999);
      result = result.filter((e) => new Date(e.date) <= endOfTo);
    }

    if (types.length > 0) {
      result = result.filter((e) =>
        types.includes(e.type.toLowerCase() as EventCategory)
      );
    }

    return result;
  }, [events, status, search, dateFrom, dateTo, types]);

  const sorting: SortingState = useMemo(
    () => [{ id: sort, desc: order === "desc" }],
    [sort, order]
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (next.length > 0) {
        setParams({
          sort: next[0].id,
          order: next[0].desc ? "desc" : "asc",
          page: 1,
        });
      } else {
        // User toggled sort off — reset to default
        setParams({
          sort: null,
          order: null,
          page: 1,
        });
      }
    },
    [sorting, setParams]
  );

  const table = useReactTable<TimeleftEvent>({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize: perPage })
          : updater;
      setParams({
        page: next.pageIndex + 1,
        perPage: next.pageSize,
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true,
  });

  const handleRowClick = (eventId: string) => {
    setEventId(eventId);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 py-20">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ArrowsClockwise className="size-5 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-medium">Failed to load events</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching the data.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="cursor-pointer rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <EventStats events={events} isLoading={isLoading} />

      <div className="flex flex-col gap-3 animate-fade-up stagger-3">
        <EventTableToolbar />

        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-border/50 bg-muted/30 hover:bg-muted/30"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group cursor-pointer border-border/40 transition-colors hover:bg-muted/40"
                    onClick={() => handleRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        No events found
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        Try adjusting your search or filter criteria.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <EventTablePagination table={table} />
      </div>

      <EventDetailSheet events={events} />
    </div>
  );
};
