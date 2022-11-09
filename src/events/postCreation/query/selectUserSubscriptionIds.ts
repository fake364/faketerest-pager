const selectUserSubscriptionIds = (userId: number) =>
  `SELECT fk_from_user as id FROM users_subscriptions WHERE fk_to_user=${userId}`;

export default selectUserSubscriptionIds;
