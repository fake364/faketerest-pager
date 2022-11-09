const selectUserNameById = (id: number) =>
  `SELECT "FIRST_NAME","LAST_NAME","USERNAME" FROM registrations WHERE "ID"=${id}`;

export default selectUserNameById;
