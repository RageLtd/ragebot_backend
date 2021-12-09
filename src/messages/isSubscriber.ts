import { Userstate } from "tmi.js";

export function isSubscriber(userState: Userstate) {
  return userState.subscriber || userState["display-name"] === "RageLtd";
}
