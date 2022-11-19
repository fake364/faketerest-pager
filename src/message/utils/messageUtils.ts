import { uuid } from "uuidv4";
import EVENT_TYPE, {
  CLIENT_EVENTS
} from "faketerest-utilities/dist/events/types";
import MessagePayload from "faketerest-utilities/dist/events/message/type";
import { RedisClient } from "../../server";
import MessageUtils from "faketerest-utilities/dist/events/message/messageUtils";
import sendPayloadToClients from "../../clients/sendPayloadToCliends";

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

export const sendMessageNotificationToParticipants = (
  roomKey: string,
  myId: number,
  message: MessagePayload
) =>
  MessageUtils.getParticipants(roomKey, myId).forEach((participantId) => {
    sendPayloadToClients(
      CLIENT_EVENTS.MESSAGE_NOTIFICATIONS,
      participantId,
      message
    );
  });
