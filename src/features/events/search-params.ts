import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  createSearchParamsCache,
} from "nuqs/server";

export const STATUS_VALUES = ["upcoming", "live", "past"] as const;

export const eventsSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: parseAsString.withDefault("date"),
  order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
  status: parseAsString.withDefault(""),
  search: parseAsString.withDefault(""),
  event: parseAsString.withDefault(""),
};

export const eventsSearchParamsCache = createSearchParamsCache(eventsSearchParams);
