import { uuid } from "uuidv4";
import EVENT_TYPE from "faketerest-utilities/dist/events/types";
import MessagePayload from "faketerest-utilities/dist/events/message/type";
import { RedisClient } from "../../server";

export const createMessagePayload = (
  text: string,
  authorId: number
): MessagePayload => ({
  messageId: uuid(),
  text,
  createdAt: new Date().toISOString(),
  authorId,
  eventType: EVENT_TYPE.MESSAGE,
  hasBeenRead: false
});

export const pushMessage = async (toRoom: string, payload: MessagePayload) => {
  await RedisClient.connect();
  await RedisClient.hSet(toRoom, payload.messageId, JSON.stringify(payload));
  await RedisClient.disconnect();
};
