import PostCreateUtils from "./utils";
import { databasePool } from "../../server";
import selectUserName from "./query/selectUserName";
import selectUserSubscriptionIds from "./query/selectUserSubscriptionIds";
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
      const userRow = userData.rows[0];
      const subscribedIdRow: { id: string }[] = subscribedIds.rows;
      const object: PostCreatePayload =
        PostCreateUtils.mapDbInstanceToPostCreatePayload(
          userRow,
          authorId,
          postId
        );
      await PostCreateUtils.saveAndNotifyUsersOnPostCreation(
        object,
        subscribedIdRow
      );
    }
  } else {
    console.warn("This is not post create notification", action);
  }
};

const PostCreation = { checkTypeAndSaveNotification };

export default PostCreation;
