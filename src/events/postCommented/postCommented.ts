import PostCommentedParseUtils from "./utils/parseUtils";
import { databasePool, RedisClient } from "../../server";
import selectUserNameById from "../postCreation/query/selectUserName";
import { PostCommentedPayload } from "faketerest-utilities/dist/events/comment/types";
import EVENT_TYPE, {
  CLIENT_EVENTS
} from "faketerest-utilities/dist/events/types";
import EventParseUtils from "../utils/parseUtils";
import sendPayloadToClients from "../../clients/sendPayloadToCliends";
import selectPostAuthorUserIdByComment from "./query/selectPostAuthorUserIdByComment";

const checkActionAndSaveNotification = async (action: string[]) => {
  if (PostCommentedParseUtils.isPostCommentedAction(action)) {
    const commentText = action[2];
    const postId = action[3];
    const authorId = Number(action[4]);
    try {
      const { rows, rowCount } = await databasePool.query(
        selectUserNameById(authorId)
      );
      if (rowCount === 1) {
        const payload: PostCommentedPayload =
          PostCommentedParseUtils.mapDataToPayload(
            postId,
            authorId,
            rows[0].FIRST_NAME,
            rows[0].LAST_NAME,
            commentText
          );
        await RedisClient.connect();
        await RedisClient.set(
          EventParseUtils.getDataKeyByEvent(authorId, EVENT_TYPE.COMMENT),
          JSON.stringify(payload)
        );
        await RedisClient.disconnect();
        const { rowCount: usersCount, rows: userRows } =
          await databasePool.query(selectPostAuthorUserIdByComment(postId));
        if (usersCount === 1) {
          sendPayloadToClients(
            CLIENT_EVENTS.COMMON_NOTIFICATION,
            Number(userRows[0].fk_user_id),
            payload
          );
        }
      }
    } catch (e) {
      console.error("Error fetching user name", e);
    }
  } else {
    console.warn("There is incorrect action", action);
  }
};

const PostCommented = { checkActionAndSaveNotification };

export default PostCommented;
