import { v4 as uuidv4 } from "uuid";
import {
  clientRegistry,
  customCommandRegistry,
  faunaClient,
  tmiClient,
} from "..";
import {
  getIsUserBotEnabledStateQuery,
  setUserBotEnabledStateQuery,
} from "../users/userQueries";
import {
  addBacklogQuery,
  getBacklogQuery,
  removeBacklogQuery,
} from "./backlog/backlogQueries";
import {
  addCustomCommandQuery,
  setCustomCounterQuery,
  updateCustomCommandByNameQuery,
} from "./custom/customQueries";
import {
  getCurrentGameQuery,
  getCurrentLobbyQuery,
  getCurrentRunQuery,
  setCurrentGameQuery,
  setCurrentLobbyQuery,
  setCurrentRunQuery,
} from "./game/gameQueries";

export enum Remote {
  GAME,
  RUN,
  LOBBY,
  BACKLOG,
  ADD_BACKLOG,
  REMOVE_BACKLOG,
}

export async function setRemote(remote: Remote, target: string, value: string) {
  const client = await clientRegistry.getClient(target);

  switch (remote) {
    case Remote.GAME: {
      return client?.query(setCurrentGameQuery(value));
    }
    case Remote.LOBBY: {
      return client?.query(setCurrentLobbyQuery(value));
    }
    case Remote.RUN: {
      return client?.query(setCurrentRunQuery(value));
    }
    case Remote.ADD_BACKLOG: {
      const [name, notes] = value.split("|");
      return client?.query(addBacklogQuery(name.trim(), notes.trim()));
    }
    case Remote.REMOVE_BACKLOG: {
      return client?.query(removeBacklogQuery(value));
    }
  }
}

export async function setCommand(
  target: string,
  name: string,
  behavior: string,
  modOnly: boolean,
  subOnly: boolean,
  timeoutInMillis: number,
  response: string
) {
  const client = await clientRegistry.getClient(target);

  return client?.query(
    addCustomCommandQuery({
      id: uuidv4(),
      name,
      behavior,
      modOnly,
      subOnly,
      timeoutInMillis,
      response,
      isCaseSensitive: true,
      isEnabled: true,
    })
  );
}

export async function updateCommand(
  target: string,
  name: string,
  behavior: string,
  modOnly: boolean,
  subOnly: boolean,
  timeoutInMillis: number,
  response: string,
  isEnabled: boolean
) {
  const client = await clientRegistry.getClient(target);

  return client?.query(
    updateCustomCommandByNameQuery(
      name,
      behavior,
      modOnly,
      subOnly,
      timeoutInMillis,
      response,
      isEnabled
    )
  );
}

export async function setCustomCounter(target: string, command: string) {
  const client = await clientRegistry.getClient(target);

  return client?.query(setCustomCounterQuery(command));
}

export async function getRemote(remote: Remote, target: string) {
  const client = await clientRegistry.getClient(target);

  switch (remote) {
    case Remote.GAME: {
      return client?.query(getCurrentGameQuery());
    }
    case Remote.LOBBY: {
      return client?.query(getCurrentLobbyQuery());
    }
    case Remote.RUN: {
      return client?.query(getCurrentRunQuery());
    }
    case Remote.BACKLOG: {
      return client?.query(getBacklogQuery());
    }
  }
}

export async function enableBot(target: string) {
  await faunaClient.query(setUserBotEnabledStateQuery(target, true));
  await customCommandRegistry.refreshCommands(target);

  tmiClient.say(target, "Ragebot enabled");
}

export async function disableBot(target: string) {
  await faunaClient.query(setUserBotEnabledStateQuery(target, false));
  customCommandRegistry.disableTimers(target);

  tmiClient.say(target, "Ragebot disabled");
}

export async function isBotEnabled(target: string) {
  return await faunaClient.query(getIsUserBotEnabledStateQuery(target));
}
