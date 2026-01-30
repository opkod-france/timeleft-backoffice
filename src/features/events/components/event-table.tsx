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
import type { TimeleftEvent } from "@/features/events/types";

export const EventTable = () => {
  const { data: events, isLoading, isError, refetch } = useEvents();

  const [{ page, perPage, sort, order, status, search }, setParams] =
    useQueryStates(
      {
        page: eventsSearchParams.page,
        perPage: eventsSearchParams.perPage,
        sort: eventsSearchParams.sort,
        order: eventsSearchParams.order,
        status: eventsSearchParams.status,
        search: eventsSearchParams.search,
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

    return result;
  }, [events, status, search]);

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
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Failed to load events.</p>
        <button
          onClick={() => refetch()}
          className="text-sm underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <EventStats events={events} isLoading={isLoading} />

      <div className="flex flex-col gap-4">
        <EventTableToolbar />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                  <TableRow key={i}>
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
                    className="cursor-pointer"
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
                    className="h-24 text-center"
                  >
                    <span className="text-muted-foreground">
                      No events found.
                    </span>
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
