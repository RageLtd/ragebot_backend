import { Userstate } from "tmi.js";

export function isModerator(userState: Userstate) {
  return userState.mod || userState["display-name"] === "RageLtd";
}
