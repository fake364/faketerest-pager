import PostCommentedParseUtils from "./utils/parseUtils";
import { databasePool, RedisClient } from "../../server";
import selectUserNameById from "../postCreation/query/selectUserName";
import { PostCommentedPayload } from "faketerest-utilities/dist/events/comment/types";
import EVENT_TYPE, {
  CLIENT_EVENTS,
  Nullable
} from "faketerest-utilities/dist/events/types";
import EventParseUtils from "../utils/parseUtils";
import sendPayloadToClients from "../../clients/sendPayloadToCliends";
import selectPostAuthorUserIdByComment from "./query/selectPostAuthorUserIdByComment";

const saveCommentNotification = async (
  key: string,
  payload: PostCommentedPayload
) => {
  await RedisClient.connect();
  await RedisClient.set(key, JSON.stringify(payload));
  await RedisClient.disconnect();
};

const getPayloadAndKey = (
  firstName: string,
  lastName: Nullable<string>,
  commentAuthorId: number,
  text: string,
  postId: string,
  saveForUserId: number
) => {
  const payload: PostCommentedPayload =
    PostCommentedParseUtils.mapDataToPayload(
      postId,
      commentAuthorId,
      firstName,
      lastName,
      text
    );
  const key = EventParseUtils.getDataKeyByEvent(
    saveForUserId,
    EVENT_TYPE.COMMENT
  );
  return { key, payload };
};

const saveAndNotifyAuthor = async (
  commentAuthorId: number,
  postId: string,
  key: string,
  payload: PostCommentedPayload
) => {
  const { rowCount: usersCount, rows: userRows } = await databasePool.query(
    selectPostAuthorUserIdByComment(postId)
  );
  if (usersCount === 1) {
    const postAuthorId = Number(userRows[0].fk_user_id);
    if (postAuthorId !== commentAuthorId) {
      await saveCommentNotification(key, payload);

      sendPayloadToClients(
        CLIENT_EVENTS.COMMON_NOTIFICATION,
        Number(userRows[0].fk_user_id),
        { payload, key: key.split(":")[2] }
      );
    }
  }
};

const checkActionAndSaveNotification = async (action: string[]) => {
  if (PostCommentedParseUtils.isPostCommentedAction(action)) {
    const { commentText, commentAuthorId, postId } =
      PostCommentedParseUtils.getActionPayload(action);
    try {
      const { rows, rowCount } = await databasePool.query(
        selectUserNameById(commentAuthorId)
      );
      const { rowCount: usersCount, rows: userRows } = await databasePool.query(
        selectPostAuthorUserIdByComment(postId)
      );
      if (rowCount === 1 && usersCount === 1) {
        const postAuthorId = Number(userRows[0].fk_user_id);
        const { key, payload } = getPayloadAndKey(
          rows[0].FIRST_NAME,
          rows[0].LAST_NAME,
          commentAuthorId,
          commentText,
          postId,
          postAuthorId
        );
        await saveAndNotifyAuthor(commentAuthorId, postId, key, payload);
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
