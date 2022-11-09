import {
  addSocketToMap,
  getUserIdHeaderFromSocket,
  removeDisconnectedSocket,
  sendUniqueNotifications
} from "../socketUtils/socketUtils";
import { PagerServer, RedisClient } from "../server";

PagerServer.on("connection", async (socket) => {
  addSocketToMap(socket);
  await sendUniqueNotifications(socket);
  socket.on("disconnect", () => {
    removeDisconnectedSocket(socket);
  });

  socket.on("read-notifications", async (keys: string[]) => {
    console.log("read notifications", keys);
    const userId = getUserIdHeaderFromSocket(socket) as string;
    if (keys?.length > 0 && userId) {
      try {
        await RedisClient.connect();
        for (const key of keys) {
          const notificationKey = await RedisClient.keys(
            `${getUserIdHeaderFromSocket(socket)}:*:${key}`
          );
          if (notificationKey[0]) {
            const entry = await RedisClient.get(notificationKey[0]);
            if (entry) {
              const parsedNotification = JSON.parse(entry);
              parsedNotification.hasBeenRead = true;
              await RedisClient.set(
                notificationKey[0],
                JSON.stringify(parsedNotification)
              );
            }
          }
        }

        await RedisClient.disconnect();
      } catch (e) {
        console.error("Error trying to save notifications", e);
      }
    }
  });

  socket.on("get-notifications", () => {
    sendUniqueNotifications(socket);
  });
});
