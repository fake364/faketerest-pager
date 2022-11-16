import { createAdapter, PostgresAdapter } from "@socket.io/postgres-adapter";
import { createClient } from "redis";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const { Pool } = require("pg");

export const PagerServer = new Server({ cors: { origin: "*" } });
// DB_USERNAME=postgres
// DB_NAME=postgres
// DB_PASSWORD=d48t4r
// DB_HOST=localhost:5432
export const databasePool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "d48t4r",
  port: 5432
});

export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap> & {
  userId?: number;
};

export const SocketMapByUserId: {
  [key: string]: SocketType[];
} = {};

// @ts-ignore
const adapter: PostgresAdapter = createAdapter(databasePool, {
  channelPrefix: "pager"
});

// @ts-ignore
PagerServer.adapter(adapter);

export const RedisClient = createClient({
  url: "redis://localhost:6379"
});

PagerServer.listen(3003);

import "./listeners/pg-listeners";
import "./listeners/server-listeners";
