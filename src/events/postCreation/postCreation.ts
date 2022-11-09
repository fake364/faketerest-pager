import PostCreateUtils from "./utils";
import { databasePool, RedisClient } from "../../server";
import selectUserName from "./query/selectUserName";
import selectUserSubscriptionIds from "./query/selectUserSubscriptionIds";
import EventParseUtils from "../utils/parseUtils";
import sendPayloadToClients from "../../clients/sendPayloadToCliends";
import { CLIENT_EVENTS } from "../../clients/enums";
import EVENT_TYPE from "faketerest-utilities/dist/events/types";
import PostCreatePayload from "faketerest-utilities/dist/events/postCreate/types";

const checkTypeAndSaveNotification = async (action: string[]) => {
  if (PostCreateUtils.isActionStringType(action)) {
    const postId = action[2];
    const authorId = Number(action[3]);
    const userData = await databasePool.query(selectUserName(authorId));
    const subscribedIds = await databasePool.query(
      selectUserSubscriptionIds(authorId)
    );
    if (userData.rowCount === 1 && subscribedIds.rowCount > 0) {
      await RedisClient.connect();
      const userRow = userData.rows[0];
      const subscribedIdRow: { id: string }[] = subscribedIds.rows;
      const object: PostCreatePayload = {
        hasBeenRead: false,
        createdAt: new Date().toISOString(),
        postId,
        eventType: EVENT_TYPE.POST_CREATE,
        authorId,
        authorFirstname: userRow.FIRST_NAME,
        authorLastName: userRow.LAST_NAME,
        authorUsername: userRow.USERNAME
      };
      for (const subscribedId of subscribedIdRow) {
        await RedisClient.set(
          EventParseUtils.getDataKeyByEvent(
            Number(subscribedId.id),
            EVENT_TYPE.POST_CREATE
          ),
          JSON.stringify(object)
        );

        // TODO TO CHANGE CLIENT EVENT NAME TO MORE COMMON ONE LIKE "NOTIFICATION"
        sendPayloadToClients(
          CLIENT_EVENTS.COMMON_NOTIFICATION,
          Number(subscribedId.id),
          object
        );
      }
      await RedisClient.disconnect();
    }
  } else {
    console.warn("This is not post create notification", action);
  }
};

const PostCreation = { checkTypeAndSaveNotification };

export default PostCreation;
