const getFromToSubscription=(from:number,to:number)=>`
SELECT fk_to_user as toId,fk_from_user
    as fromId,reg1."FIRST_NAME" as fromFirstName,reg1."LAST_NAME"
    as fromLastName,reg1."USERNAME" as fromUsername,
    reg2."FIRST_NAME" as toFirstName,reg2."LAST_NAME"
    as toLastName,reg2."USERNAME" as toUsername,
    now()::timestamp with time zone as createdat
  FROM public.users_subscriptions 
    LEFT JOIN public.registrations as reg1 ON 
        reg1."ID" = users_subscriptions.fk_from_user
    LEFT JOIN public.registrations as reg2 ON
        reg2."ID" = users_subscriptions.fk_to_user
        WHERE reg1."ID"=${from} AND reg2."ID"=${to}
`;

export default getFromToSubscription;