import { Userstate } from "tmi.js";
import { tmiClient } from "../..";
import { isModerator } from "../../utils/permissioning";
import { getRemote, Remote, setRemote } from "../utils";
import { BacklogResponse } from "./backlogQueries";

export async function getBacklog(target: string) {
  const { data: backlog } = (await getRemote(
    Remote.BACKLOG,
    target
  )) as BacklogResponse;

  if (backlog) {
    tmiClient.say(
      target,
      `Backlog: ${backlog
        .map(({ name, notes }) => `${name} ${notes}`)
        .join(", ")}`
    );
    return;
  }

  tmiClient.say(target, "Backlog is empty!");
}

export async function addBacklog(
  target: string,
  userState: Userstate,
  value: string
) {
  if (isModerator(userState)) {
    await setRemote(Remote.ADD_BACKLOG, target, value);

    tmiClient.say(target, `Added ${value.split("|")[0]} to backlog`);
  }
}

export async function removeBacklog(
  target: string,
  userState: Userstate,
  name: string
) {
  if (isModerator(userState)) {
    await setRemote(Remote.REMOVE_BACKLOG, target, name);
  }
}
