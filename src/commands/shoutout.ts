import { Userstate } from "tmi.js";
import { tmiClient } from "..";
import { isModerator } from "../messages/isModerator";

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
