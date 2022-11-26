import { createAdapter, PostgresAdapter } from "@socket.io/postgres-adapter";
import { createClient } from "redis";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
require("dotenv").config();

const { Pool } = require("pg");

export const PagerServer = new Server({ cors: { origin: "*" } });

export const databasePool = new Pool({
  user: process.env.POSTGRE_DB_USER,
  host: process.env.POSTGRE_DB_HOST,
  database: process.env.POSTGRE_DB_NAME,
  password: process.env.POSTGRE_DB_PASS,
  port: process.env.POSTGRE_DB_PORT
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
  url: `redis://${process.env.REDIS_DB_HOST}`,
  password: process.env.REDIS_DB_PASS
});

PagerServer.listen(3003);

import "./listeners/pg-listeners";
import "./listeners/server-listeners";
