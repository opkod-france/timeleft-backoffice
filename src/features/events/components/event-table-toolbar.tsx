"use client";

import { startTransition } from "react";
import { useQueryStates } from "nuqs";
import {
  MagnifyingGlass,
  X,
  SlidersHorizontal,
  CalendarBlank,
  Tag,
  Check,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { eventsSearchParams, CATEGORY_VALUES } from "@/features/events/search-params";
import { statusLabel, STATUS_OPTIONS, categoryConfig } from "@/features/events/helpers";
export const EventTableToolbar = () => {
  const [{ search, status, dateFrom, dateTo, types }, setParams] =
    useQueryStates(
      {
        search: eventsSearchParams.search,
        status: eventsSearchParams.status,
        dateFrom: eventsSearchParams.dateFrom,
        dateTo: eventsSearchParams.dateTo,
        types: eventsSearchParams.types,
        page: eventsSearchParams.page,
      },
      { shallow: false }
    );

  const hasFilters =
    search !== "" ||
    status !== "" ||
    dateFrom !== null ||
    dateTo !== null ||
    types.length > 0;

  const activeFilterCount =
    (search !== "" ? 1 : 0) +
    (status !== "" ? 1 : 0) +
    (dateFrom !== null || dateTo !== null ? 1 : 0) +
    (types.length > 0 ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm group">
          <MagnifyingGlass className="text-muted-foreground/50 absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors group-focus-within:text-foreground/70" />
          <Input
            placeholder="Search events, cities, zones..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              startTransition(() => {
                setParams({ search: value || null, page: 1 });
              });
            }}
            className="pl-9 pr-16 h-9 rounded-lg bg-card border-border/60 transition-all focus:border-brand-pink/40 focus:ring-brand-pink/15"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-2xs font-medium text-muted-foreground/50 sm:flex">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </div>

        {/* Status filter */}
        <Select
          value={status || "all"}
          onValueChange={(value) =>
            setParams({
              status: value === "all" ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-38 h-9 rounded-lg bg-card border-border/60 transition-all data-[state=open]:border-brand-pink/40">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5 text-muted-foreground/60" />
              <SelectValue placeholder="All statuses" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`size-1.5 rounded-full ${
                      s === "live"
                        ? "bg-emerald-500"
                        : s === "upcoming"
                          ? "bg-blue-500"
                          : "bg-muted-foreground/40"
                    }`}
                  />
                  {statusLabel[s]}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 w-56 cursor-pointer justify-start rounded-lg bg-card border-border/60 text-sm font-normal transition-all",
                !dateFrom && !dateTo && "text-muted-foreground",
                (dateFrom || dateTo) && "border-brand-pink/40"
              )}
            >
              <CalendarBlank className="size-3.5 text-muted-foreground/60 mr-1.5" />
              {dateFrom && dateTo
                ? `${format(dateFrom, "MMM d")} – ${format(dateTo, "MMM d, yyyy")}`
                : dateFrom
                  ? `From ${format(dateFrom, "MMM d, yyyy")}`
                  : dateTo
                    ? `Until ${format(dateTo, "MMM d, yyyy")}`
                    : "Date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: dateFrom ?? undefined,
                to: dateTo ?? undefined,
              }}
              onSelect={(range) =>
                setParams({
                  dateFrom: range?.from ?? null,
                  dateTo: range?.to ?? null,
                  page: 1,
                })
              }
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Event type multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 cursor-pointer rounded-lg bg-card border-border/60 text-sm font-normal transition-all gap-1.5",
                types.length === 0 && "text-muted-foreground",
                types.length > 0 && "border-brand-pink/40"
              )}
            >
              <Tag className="size-3.5 text-muted-foreground/60" />
              {types.length === 0
                ? "Event type"
                : types.length === CATEGORY_VALUES.length
                  ? "All types"
                  : `${types.length} type${types.length > 1 ? "s" : ""}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            <div className="flex flex-col gap-1">
              {CATEGORY_VALUES.map((cat) => {
                const config = categoryConfig[cat];
                const Icon = config.icon;
                const isSelected = types.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const next = isSelected
                        ? types.filter((t) => t !== cat)
                        : [...types, cat];
                      setParams({
                        types: next.length > 0 ? next : null,
                        page: 1,
                      });
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "border-brand-pink bg-brand-pink text-white"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && <Check className="size-3" weight="bold" />}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-2xs font-semibold uppercase tracking-wider ${config.className}`}
                    >
                      <Icon className="size-3" />
                      {config.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active filter indicator & reset */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setParams({
                search: null,
                status: null,
                dateFrom: null,
                dateTo: null,
                types: null,
                page: 1,
              })
            }
            className="h-9 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-brand-pink/10 text-2xs font-semibold text-brand-pink dark:bg-brand-pink/20">
              {activeFilterCount}
            </span>
            Clear
            <X className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
