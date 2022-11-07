import { PoolClient } from "pg";
import EventParseUtils from "../events/utils/parseUtils";
import { databasePool } from "../server";

databasePool.on("error", (err: Error) => {
  console.error("Postgres error", err);
});

databasePool.on("connect", (client: PoolClient) => {
  client.on("notification", (e) => {
    if (e.payload && e.payload.startsWith("EVENT|")) {
      console.info("Got event", e.payload);
      EventParseUtils.parseEventString(e.payload);
    }
  });
});
