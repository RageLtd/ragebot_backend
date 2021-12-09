import { Userstate } from "tmi.js";
import { tmiClient } from "../../index";
import { isModerator } from "../../messages/isModerator";
import { getRemote, Remote, setRemote } from "../utils";
import { GameResponse, LobbyResponse, RunResponse } from "./gameQueries";

export async function setGame(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await setRemote(Remote.GAME, target, params.join(" "));

    tmiClient.say(target, `Current game set`);
  }
}

export async function getGame(target: string) {
  const {
    data: { name: currentGame },
  } = (await getRemote(Remote.GAME, target)) as GameResponse;

  if (currentGame) {
    tmiClient.say(target, `Current game is: ${currentGame}`);
    return;
  }

  tmiClient.say(target, "Game is not yet set");
}

export async function setLobby(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await setRemote(Remote.LOBBY, target, params.join(" "));

    tmiClient.say(target, "Lobby code set");
  }
}

export async function getLobby(target: string) {
  const {
    data: { value: currentLobby },
  } = (await getRemote(Remote.LOBBY, target)) as LobbyResponse;

  if (currentLobby) {
    tmiClient.say(target, `Lobby code: ${currentLobby}`);
    return;
  }
  tmiClient.say(target, "No lobby code set");
}

export async function setRun(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await setRemote(Remote.RUN, target, params.join(" "));

    tmiClient.say(target, "Current run set");
  }
}

export async function getRun(target: string) {
  const {
    data: { value: currentRun },
  } = (await getRemote(Remote.RUN, target)) as RunResponse;

  if (currentRun) {
    tmiClient.say(target, `Current run: ${currentRun}`);
    return;
  }
  tmiClient.say(target, "Run not set");
}
