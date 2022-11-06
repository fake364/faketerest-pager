import {
  RedisSubscriptionPayload,
  SubscriptionPayload,
} from "../../../redis/subscription/type";
import EVENT_TYPE from "../../types";

export const mapRedisSubscriptionTypeToBase = (
  {
    fromusername,
    tofirstname,
    tolastname,
    tousername,
    fromid,
    fromlastname,
    toid,
    fromfirstname,
    createdat,
  }: RedisSubscriptionPayload,
  hasBeenRead: boolean,
  eventType: EVENT_TYPE
): SubscriptionPayload => ({
  toUsername: tousername,
  fromUsername: fromusername,
  toFirstname: tofirstname,
  toLastname: tolastname,
  fromFirstname: fromfirstname,
  fromId: fromid,
  fromLastname: fromlastname,
  toId: toid,
  hasBeenRead,
  createdAt: createdat,
  eventType,
});
