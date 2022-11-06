import {BaseEvent} from "../../events/types";

export type RedisSubscriptionPayload = {
    toid: string;
    fromid: string;
    fromfirstname: string;
    fromlastname: string | null;
    fromusername: string;
    tofirstname: string;
    tolastname: string | null;
    tousername: string;
    createdat: string;
};

export interface SubscriptionPayload extends BaseEvent {
    toId: string;
    fromId: string;
    fromFirstname: string;
    fromLastname: string | null;
    fromUsername: string;
    toFirstname: string;
    toLastname: string | null;
    toUsername: string;
}