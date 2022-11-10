import EVENT_TYPE, {
  CLIENT_EVENTS,
  Nullable
} from "faketerest-utilities/dist/events/types";
import PostCreatePayload from "faketerest-utilities/dist/events/postCreate/types";
import { RedisClient } from "../../server";
import EventParseUtils from "../utils/parseUtils";
import sendPayloadToClients from "../../clients/sendPayloadToCliends";
import { NotificationType } from "faketerest-utilities";

const isActionStringType = (
  action: any[]
): action is [string, string, string, string] => {
  return (
    action.every((element) => typeof element === "string") &&
    action[0] === EVENT_TYPE.POST_CREATE &&
    action[1] === "INSERT" &&
    !isNaN(Number(action[3]))
  );
};

const mapDbInstanceToPostCreatePayload = (
  userRow: {
    FIRST_NAME: string;
    LAST_NAME: Nullable<string>;
    USERNAME: string;
  },
  authorId: number,
  postId: string
): PostCreatePayload => ({
  hasBeenRead: false,
  createdAt: new Date().toISOString(),
  postId,
  eventType: EVENT_TYPE.POST_CREATE,
  authorId,
  authorFirstname: userRow.FIRST_NAME,
  authorLastName: userRow.LAST_NAME,
  authorUsername: userRow.USERNAME
});

const saveAndNotifyUsersOnPostCreation = async (
  object: PostCreatePayload,
  ids: { id: string }[]
) => {
  await RedisClient.connect();
  for (const subscribedId of ids) {
    const notificationKey = EventParseUtils.getDataKeyByEvent(
      Number(subscribedId.id),
      EVENT_TYPE.POST_CREATE
    );
    await RedisClient.set(notificationKey, JSON.stringify(object));

    sendPayloadToClients(
      CLIENT_EVENTS.COMMON_NOTIFICATION,
      Number(subscribedId.id),
      { payload: object, key: notificationKey } as NotificationType
    );
  }
  await RedisClient.disconnect();
};

const PostCreateUtils = {
  saveAndNotifyUsersOnPostCreation,
  isActionStringType,
  mapDbInstanceToPostCreatePayload
};

export default PostCreateUtils;
