import { RedisClient, SocketMapByUserId, SocketType } from "../server";
import {
  filterAndSortNotifications,
  NotificationType
} from "faketerest-utilities";
import { CLIENT_EVENTS } from "faketerest-utilities/dist/events/types";
import { CUSTOM_HEADERS } from "faketerest-utilities/dist/common/enums";

export const getUserIdHeaderFromSocket = (socket: SocketType) =>
  socket.handshake.headers[CUSTOM_HEADERS.X_CLIENT_ID];

export const addSocketToMap = (socket: SocketType) => {
  const userId = getUserIdHeaderFromSocket(socket) as string | undefined;
  if (userId) {
    socket.userId = Number(userId);
    if (!SocketMapByUserId[userId]) {
      SocketMapByUserId[userId] = [];
    }
    SocketMapByUserId[userId].push(socket);
    console.info("Pushed socket", socket.id);
  }
};

export const removeDisconnectedSocket = (socket: SocketType) => {
  const userId = getUserIdHeaderFromSocket(socket) as string | undefined;

  if (userId) {
    SocketMapByUserId[userId] = SocketMapByUserId[userId].filter(
      ({ id }) => socket.id !== id
    );
    console.log("Deleted socket", socket.id, "from", userId);
  }
};

export const sendUniqueNotifications = async (socket: SocketType) => {
  const userId = getUserIdHeaderFromSocket(socket) as string | undefined;
  if (userId) {
    await RedisClient.connect();
    const keys = await RedisClient.keys(`${userId}:*`);
    const notifications: NotificationType[] = [];
    for (const key of keys) {
      const result = await RedisClient.get(key);
      const parsedKey = key.split(":")[2];
      if (result && parsedKey) {
        try {
          notifications.push({ payload: JSON.parse(result), key: parsedKey });
        } catch (e) {
          console.warn("Wrong entry");
        }
      }
    }

    socket.emit(
      CLIENT_EVENTS.INIT_NOTIFICATIONS,
      filterAndSortNotifications(notifications)
    );

    await RedisClient.disconnect();
  }
};
