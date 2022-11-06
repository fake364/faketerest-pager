import { PoolClient } from "pg";
import { PostgresAdapter } from "@socket.io/postgres-adapter";
import { createClient } from "redis";
import EventParseUtils from "./events/utils/parseUtils";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getUserIdHeaderFromSocket } from "./socketUtils/socketUtils";

const { Pool } = require("pg");

export const PagerServer = new Server(3003, { cors: { origin: "*" } });
// DB_USERNAME=postgres
// DB_NAME=postgres
// DB_PASSWORD=d48t4r
// DB_HOST=localhost:5432
export const databasePool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "d48t4r",
  port: 5432,
});

export const SocketMapByUserId: {
  [key: string]: Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >[];
} = {};

databasePool.on("error", (err: Error) => {
  console.error("Postgres error", err);
});

databasePool.on("connect", (client: PoolClient) => {
  client.on("notification", (e) => {
    if (e.payload && e.payload.startsWith("EVENT|")) {
      console.log(e.payload);
      EventParseUtils.parseEventString(e.payload);
    }
  });
});

PagerServer.on("connection", (socket) => {
  console.log("Connected", socket.handshake.headers);
  const userId = getUserIdHeaderFromSocket(socket) as string | undefined;
  if (userId) {
    if (!SocketMapByUserId[userId]) {
      SocketMapByUserId[userId] = [];
    }
    SocketMapByUserId[userId].push(socket);
    console.log("Pushed socket", socket.id);
  }
  socket.on("disconnect", () => {
    if (userId) {
      SocketMapByUserId[userId] = SocketMapByUserId[userId].filter(
        ({ id }) => socket.id !== id
      );
      console.log("Deleted socket", socket.id, "from", userId);
    }
  });
});

// @ts-ignore
const adapter: PostgresAdapter = createAdapter(databasePool, {
  channelPrefix: "pager",
});

// @ts-ignore
PagerServer.adapter(adapter);

export const RedisClient = createClient({
  url: "redis://localhost:6379",
});
