import { Userstate } from "tmi.js";

export interface hasPermissions {
  modOnly?: boolean;
  subOnly?: boolean;
  followerOnly?: boolean;
  regularOnly?: boolean;
}

export function isModerator(userState: Userstate) {
  return userState.mod || userState["display-name"] === "RageLtd";
}

export function isSubscriber(userState: Userstate) {
  return userState.subscriber || userState["display-name"] === "RageLtd";
}

// export function isFollower(userState: Userstate) {
//   return userState.
// }

export function userHasPermission(
  userState: Userstate,
  behavior: hasPermissions
) {
  if (behavior.modOnly && !isModerator(userState)) {
    return false;
  }
  if (behavior.subOnly && !isSubscriber(userState) && !isModerator(userState)) {
    return false;
  }
  // if (behavior.followerOnly && !isFollower(userState))
  return true;
}
