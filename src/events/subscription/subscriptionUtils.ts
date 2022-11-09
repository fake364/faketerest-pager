import { ParsedSubscriptionPayload, SubscriptionInsertPayload } from "./types";
import { databasePool, RedisClient } from "../../server";
import getFromToSubscription from "./queries/getFromToSubscription";
import EventParseUtils from "../utils/parseUtils";
import { RedisSubscriptionPayload } from "../../redis/subscription/type";
import { mapRedisSubscriptionTypeToBase } from "./mappers/mappers";
import sendPayloadToClients from "../../clients/sendPayloadToCliends";
import { CLIENT_EVENTS } from "../../clients/enums";
import EVENT_TYPE, {
  DATABASE_ACTION
} from "faketerest-utilities/dist/events/types";

const isSubscriptionInsertPayloadValid = (
  values: string[]
): values is SubscriptionInsertPayload => {
  console.info("Checking subscription type---", values);
  const isSubscriptionType = values[0] === EVENT_TYPE.SUBSCRIPTION;
  const isInsertType = values[1] === DATABASE_ACTION.INSERT;
  const isStringNumber = (str: string) => !isNaN(Number(str));
  const isFromNumber = isStringNumber(values[2]);
  const isToNumber = isStringNumber(values[3]);
  if (!isFromNumber || !isToNumber) {
    console.warn(
      "Either From or To ids provided were wrong",
      values[2],
      values[3]
    );
  }
  return isSubscriptionType && isInsertType && isFromNumber && isToNumber;
};

const parseSubscriptionAction = ([
  ,
  ,
  from,
  to
]: SubscriptionInsertPayload): ParsedSubscriptionPayload => ({
  from: Number(from),
  to: Number(to)
});

const saveSubscriptionToDB = async (
  saveForId: number,
  row: RedisSubscriptionPayload
) => {
  await RedisClient.connect();
  const modifiedRow = { ...row, createdat: row.createdat.toString() };
  const subscriptionPayload = mapRedisSubscriptionTypeToBase(
    modifiedRow,
    false,
    EVENT_TYPE.SUBSCRIPTION
  );
  const stringObj = JSON.stringify({
    ...subscriptionPayload
  });
  const key = EventParseUtils.getDataKeyByEvent(
    saveForId,
    EVENT_TYPE.SUBSCRIPTION
  );
  await RedisClient.set(key, stringObj);
  await RedisClient.disconnect();
  const parsedKey = key.split(":")[2];
  return { key: parsedKey, payload: subscriptionPayload };
};

const checkTypeAndSaveNotification = async (action: string[]) => {
  try {
    if (SubscriptionUtils.isSubscriptionInsertPayloadValid(action)) {
      const { to, from } = SubscriptionUtils.parseSubscriptionAction(action);
      const payload = await databasePool.query(getFromToSubscription(from, to));
      const row = payload.rows[0];
      if (payload.rowCount === 1) {
        const payload = await saveSubscriptionToDB(to, row);
        sendPayloadToClients(CLIENT_EVENTS.COMMON_NOTIFICATION, to, payload);
      }
    }
  } catch (e) {
    console.error("Subscription parsing error", e);
  }
};

const SubscriptionUtils = {
  isSubscriptionInsertPayloadValid,
  parseSubscriptionAction,
  checkTypeAndSaveNotification
};

export default SubscriptionUtils;
