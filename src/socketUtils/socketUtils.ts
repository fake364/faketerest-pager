import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
import {
  databasePool,
  RedisClient,
  SocketMapByUserId,
  SocketType
} from "../server";
import filterDuplicateNotifications from "./filterDuplicateNotifications";

export const getUserIdHeaderFromSocket = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => socket.handshake.headers["x-user-id"];

export const addSocketToMap = (socket: SocketType) => {
  const userId = getUserIdHeaderFromSocket(socket) as string | undefined;
  if (userId) {
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
    const notifications: any[] = [];
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
      "init-notifications",
      filterDuplicateNotifications(notifications)
    );

    await RedisClient.disconnect();
  }
};
