"use client";

import { useQueryStates } from "nuqs";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsSearchParams } from "@/features/events/search-params";
import { statusLabel, STATUS_OPTIONS } from "@/features/events/helpers";

export const EventTableToolbar = () => {
  const [{ search, status }, setParams] = useQueryStates(
    {
      search: eventsSearchParams.search,
      status: eventsSearchParams.status,
      page: eventsSearchParams.page,
    },
    { shallow: false }
  );

  const hasFilters = search !== "" || status !== "";

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) =>
            setParams({ search: e.target.value || null, page: 1 })
          }
          className="pl-9"
        />
      </div>

      <Select
        value={status || "all"}
        onValueChange={(value) =>
          setParams({
            status: value === "all" ? null : value,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {statusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setParams({ search: null, status: null, page: 1 })}
        >
          Reset
          <X className="ml-1 size-3.5" />
        </Button>
      )}
    </div>
  );
};
