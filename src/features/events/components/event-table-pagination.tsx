"use client";

import type { Table } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
} from "@phosphor-icons/react";
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
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-xs text-muted-foreground">
        <span className="font-data">{totalRows}</span> event{totalRows !== 1 ? "s" : ""}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Rows</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) =>
              setParams({ perPage: Number(value), page: 1 })
            }
          >
            <SelectTrigger size="sm" className="w-20 h-7 rounded-md text-xs border-border/60">
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

        <span className="text-xs tabular-nums text-muted-foreground">
          <span className="font-data">{page}</span>
          <span className="mx-1 text-muted-foreground/40">/</span>
          <span className="font-data">{pageCount}</span>
        </span>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setParams({ page: 1 })}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md text-muted-foreground hover:text-foreground"
          >
            <CaretDoubleLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setParams({ page: page - 1 })}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md text-muted-foreground hover:text-foreground"
          >
            <CaretLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setParams({ page: page + 1 })}
            disabled={!table.getCanNextPage()}
            className="rounded-md text-muted-foreground hover:text-foreground"
          >
            <CaretRight className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setParams({ page: pageCount })}
            disabled={!table.getCanNextPage()}
            className="rounded-md text-muted-foreground hover:text-foreground"
          >
            <CaretDoubleRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
