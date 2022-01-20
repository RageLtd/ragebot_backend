import { Userstate } from "tmi.js";
import { tmiClient } from "..";
import { isModerator } from "../utils/permissioning";

export function shoutout(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    tmiClient.say(
      target,
      `Go check out ${params[0]}, they're super awesome! https://twitch.tv/${params[0]}`
    );
  }
}
