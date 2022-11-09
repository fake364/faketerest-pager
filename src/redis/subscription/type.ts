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
