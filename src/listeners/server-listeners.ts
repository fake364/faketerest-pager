import {
  addSocketToMap,
  getUserIdHeaderFromSocket,
  removeDisconnectedSocket,
  sendUniqueNotifications
} from "../socketUtils/socketUtils";
import { PagerServer, RedisClient } from "../server";
import { CLIENT_EVENTS } from "faketerest-utilities/dist/events/types";
import Notifications from "../notifications";

PagerServer.on("connection", async (socket) => {
  addSocketToMap(socket);
  await sendUniqueNotifications(socket);
  socket.on("disconnect", () => {
    removeDisconnectedSocket(socket);
  });

  socket.on(CLIENT_EVENTS.READ_NOTIFICATIONS, async (keys: string[]) => {
    console.log("read notifications", keys);
    const userId = getUserIdHeaderFromSocket(socket) as string;
    if (userId) {
      await Notifications.readAllNotifications(userId, keys);
    }
  });
});
