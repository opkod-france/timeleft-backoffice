import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  parseAsArrayOf,
  parseAsIsoDate,
  createSearchParamsCache,
} from "nuqs/server";

export const STATUS_VALUES = ["upcoming", "live", "past"] as const;
export const CATEGORY_VALUES = ["dinner", "drink", "run"] as const;

export const eventsSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: parseAsString.withDefault("date"),
  order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
  status: parseAsString.withDefault(""),
  search: parseAsString.withDefault(""),
  event: parseAsString.withDefault(""),
  dateFrom: parseAsIsoDate,
  dateTo: parseAsIsoDate,
  types: parseAsArrayOf(parseAsStringLiteral(CATEGORY_VALUES)).withDefault([]),
};

export const eventsSearchParamsCache = createSearchParamsCache(eventsSearchParams);
