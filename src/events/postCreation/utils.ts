import EVENT_TYPE from "faketerest-utilities/dist/events/types";

const isActionStringType = (
  action: any[]
): action is [string, string, string, string] => {
  return (
    action.every((element) => typeof element === "string") &&
    action[0] === EVENT_TYPE.POST_CREATE &&
    action[1] === "INSERT" &&
    !isNaN(Number(action[3]))
  );
};

const mapDbInstanceToRedisObject=()=>{}

const PostCreateUtils = { isActionStringType };

export default PostCreateUtils;
