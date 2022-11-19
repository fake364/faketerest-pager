import { PostCommentedPayload } from "faketerest-utilities/dist/events/comment/types";
import EVENT_TYPE, { Nullable } from "faketerest-utilities/dist/events/types";

const isPostCommentedAction = (
  action: string[]
): action is [string, string, string, string, string] => {
  for (let i = 0; i < 5; i++) {
    if (typeof action[i] !== "string") {
      return false;
    }
  }
  return true;
};

const mapDataToPayload = (
  postId: string,
  userId: number,
  firstName: string,
  lastName: Nullable<string>,
  text: string
): PostCommentedPayload => ({
  hasBeenRead: false,
  createdAt: new Date().toISOString(),
  postId,
  fromUserId: userId,
  eventType: EVENT_TYPE.COMMENT,
  fromFirstname: firstName,
  fromLastname: lastName,
  text
});

const getActionPayload = (action: string[]) => {
  const commentText = action[2];
  const postId = action[3];
  const commentAuthorId = Number(action[4]);
  return { commentText, postId, commentAuthorId };
};

const PostCommentedParseUtils = {
  isPostCommentedAction,
  mapDataToPayload,
  getActionPayload
};

export default PostCommentedParseUtils;
