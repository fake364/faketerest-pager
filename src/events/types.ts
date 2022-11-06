export enum DATABASE_ACTION {
  INSERT = "INSERT",
}

export type Nullable<T> = T | null;

export type Readable = { hasBeenRead: boolean };
export type CreatedAt = { createdAt: string };
export type EventType = { eventType: EVENT_TYPE };

export interface BaseEvent extends Readable, CreatedAt, EventType {}

enum EVENT_TYPE {
  SUBSCRIPTION = "SUBSCRIPTION",
}

export default EVENT_TYPE;
