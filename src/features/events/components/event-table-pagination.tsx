"use client";

import type { Table } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsSearchParams } from "@/features/events/search-params";

type EventTablePaginationProps<T> = {
  table: Table<T>;
};

const PAGE_SIZES = [10, 20, 50];

export const EventTablePagination = <T,>({
  table,
}: EventTablePaginationProps<T>) => {
  const [{ page, perPage }, setParams] = useQueryStates(
    {
      page: eventsSearchParams.page,
      perPage: eventsSearchParams.perPage,
    },
    { shallow: false }
  );

  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-muted-foreground text-sm">
        {table.getFilteredRowModel().rows.length} event(s) total
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Rows</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) =>
              setParams({ perPage: Number(value), page: 1 })
            }
          >
            <SelectTrigger size="sm" className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm tabular-nums">
          Page {page} of {pageCount}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: 1 })}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: page - 1 })}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: page + 1 })}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setParams({ page: pageCount })}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
