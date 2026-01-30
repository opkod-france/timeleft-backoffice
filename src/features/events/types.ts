export type EventStatus = "upcoming" | "live" | "past";

export type Country = {
  id: number;
  name: string;
};

export type City = {
  id: number;
  name: string;
  country: Country;
};

export type Zone = {
  id: number;
  name: string;
  city: City;
};

export type TimeleftEvent = {
  id: string;
  type: string;
  date: string;
  zone: Zone;
  booked: number;
  capacity: number;
  status: EventStatus;
};
