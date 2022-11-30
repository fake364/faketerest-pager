import {
  addSocketToMap,
  getUserIdHeaderFromSocket,
  removeDisconnectedSocket,
  sendUniqueNotifications
} from "../socketUtils/socketUtils";
import { PagerServer, RedisClient, SocketType } from "../server";
import { CLIENT_EVENTS } from "faketerest-utilities/dist/events/types";
import Notifications from "../notifications";
import MessagePayload from "faketerest-utilities/dist/events/message/type";
import { CUSTOM_HEADERS } from "faketerest-utilities/dist/common/enums";
import {
  createMessagePayload,
  pushMessage,
  sendMessageNotificationToParticipants
} from "../message/utils/messageUtils";
import sendPayloadToClients from "../clients/sendPayloadToCliends";
import MessageUtils from "faketerest-utilities/dist/events/message/messageUtils";

PagerServer.on("connection", async (socket: SocketType) => {
  console.log('connect attempt');
  addSocketToMap(socket);
  const connectToRoom = socket.handshake.headers[CUSTOM_HEADERS.X_JOIN_ROOM];
  if (!connectToRoom) {
    await sendUniqueNotifications(socket);
  } else {
    console.log("socket", socket.userId, "joined room", connectToRoom);
    socket.join(connectToRoom);
  }
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

  socket.on("message", async (roomKey: string, text: string) => {
    const payload = createMessagePayload(text, socket.userId!);
    await pushMessage(roomKey, payload);
    console.log("ROOM", roomKey, payload);
    sendMessageNotificationToParticipants(roomKey, socket.userId!, payload);
    PagerServer.to(roomKey).emit("message", payload);
  });

  socket.on("read-messages", async (roomKey: string, keys: string) => {
    await RedisClient.connect();
    for (const key of keys) {
      const payload = await RedisClient.hGet(roomKey, key);
      if (payload) {
        try {
          const parsedPayload: MessagePayload = JSON.parse(payload);
          parsedPayload.hasBeenRead = true;
          await RedisClient.hSet(roomKey, key, JSON.stringify(parsedPayload));
        } catch (e) {
          console.error("Could not parse message");
        }
      }
    }
    await RedisClient.disconnect();

    PagerServer.to(roomKey).emit("read-messages", keys);
  });
});
