import SubscriptionUtils from "../subscription/subscriptionUtils";
import { uuid } from "uuidv4";
import EVENT_TYPE from "faketerest-utilities/dist/events/types";
import PostCreation from "../postCreation/postCreation";
import PostCommented from "../postCommented/postCommented";

const isEventType = (value: string): value is EVENT_TYPE => {
  return Object.values(EVENT_TYPE).some((type) => type === value);
};

const handleEvent = (event: EVENT_TYPE, action: string[]) => {
  switch (event) {
    case EVENT_TYPE.SUBSCRIPTION:
      SubscriptionUtils.checkTypeAndSaveNotification(action);
      break;
    case EVENT_TYPE.POST_CREATE:
      PostCreation.checkTypeAndSaveNotification(action);
      break;
    case EVENT_TYPE.COMMENT:
      PostCommented.checkActionAndSaveNotification(action);
      break;
  }
};

const parseEventString = (eventString: string) => {
  const action = eventString.split("|").slice(1);
  const eventType = action[0];
  if (isEventType(eventType)) {
    try {
      handleEvent(eventType, action);
      return;
    } catch (e) {
      console.error("Error handling event", e);
    }
  }
  console.warn("Nothing happened with payload", action);
};

const getDataKeyByEvent = (userId: number, eventType: EVENT_TYPE) =>
  `${userId}:${eventType}:${uuid()}`;

const EventParseUtils = { parseEventString, getDataKeyByEvent };

export default EventParseUtils;
