import {
  addSocketToMap,
  removeDisconnectedSocket,
  sendUniqueNotifications
} from "../socketUtils/socketUtils";
import { PagerServer } from "../server";

PagerServer.on("connection", async (socket) => {
  addSocketToMap(socket);
  await sendUniqueNotifications(socket);
  socket.on("disconnect", () => {
    removeDisconnectedSocket(socket);
  });

  socket.on("read-notifications", (...rest) => {
    console.log("read notifications", rest);
    // TODO flag notification as read
  });
});
