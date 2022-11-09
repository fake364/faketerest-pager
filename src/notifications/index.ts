import { RedisClient } from "../server";

const readNotificationByKey = async (key: string) => {
  const entry = await RedisClient.get(key);
  if (entry) {
    const parsedNotification = JSON.parse(entry);
    parsedNotification.hasBeenRead = true;
    await RedisClient.set(key, JSON.stringify(parsedNotification));
  }
};

const readAllNotifications = async (
  targetUserId: string,
  notificationsKeys: string[]
) => {
  if (notificationsKeys?.length > 0) {
    try {
      await RedisClient.connect();
      for (const key of notificationsKeys) {
        const notificationKey = await RedisClient.keys(
          `${targetUserId}:*:${key}`
        );
        if (notificationKey[0]) {
          await readNotificationByKey(notificationKey[0]);
        }
      }

      await RedisClient.disconnect();
    } catch (e) {
      console.error("Error trying to save notifications", e);
    }
  }
};

const Notifications = { readAllNotifications };

export default Notifications;
