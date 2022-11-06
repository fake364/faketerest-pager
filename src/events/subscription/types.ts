import EVENT_TYPE, { DATABASE_ACTION } from "../types";

export type SubscriptionInsertPayload = [
  EVENT_TYPE.SUBSCRIPTION,
  DATABASE_ACTION.INSERT,
  string,
  string
];

export type ParsedSubscriptionPayload = { from: number; to: number };
