import EVENT_TYPE from "../types";
import SubscriptionUtils from "../subscription/subscriptionUtils";
import { uuid } from "uuidv4";

const isEventType = (value: string): value is EVENT_TYPE => {
  return Object.values(EVENT_TYPE).some((type) => type === value);
};

const handleEvent = (event: EVENT_TYPE, action: string[]) => {
  switch (event) {
    case EVENT_TYPE.SUBSCRIPTION:
      SubscriptionUtils.checkTypeAndSaveNotification(action);
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
