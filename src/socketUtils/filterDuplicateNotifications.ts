// TODO create type
import uniqBy from "lodash/uniqBy";
import { SubscriptionPayload } from "../redis/subscription/type";

const filterDuplicateNotifications = (
  notifications: { key: string; payload: SubscriptionPayload }[]
) => {
  return uniqBy(notifications, (value) => value.payload.fromId);
};

export default filterDuplicateNotifications;
