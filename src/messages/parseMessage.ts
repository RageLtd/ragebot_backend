import { Userstate } from "tmi.js";
import { customCommandRegistry, tmiClient } from "..";
import {
  addBacklog,
  getBacklog,
  removeBacklog,
} from "../commands/backlog/backlog";
import {
  addCustomCommand,
  removeCustomCommand,
  updateCustomCommand,
} from "../commands/custom/custom";
import {
  getGame,
  getLobby,
  getRun,
  setGame,
  setLobby,
  setRun,
} from "../commands/game/game";
import { shoutout } from "../commands/shoutout";
import { isModerator } from "./isModerator";
import { isSubscriber } from "./isSubscriber";
import {
  addTermToBlacklist,
  addTermToWhitelist,
  removeTermFromBlacklist,
  removeTermFromWhitelist,
} from "./whitelist";

export function parseMessage(
  target: string,
  userState: Userstate,
  message: string
) {
  const messageArr = message.split(" ");
  const command = messageArr.shift()!;
  const params = messageArr;

  switch (command.toLowerCase()) {
    case "!setgame": {
      setGame(target, userState, params);
      return;
    }
    case "!game": {
      getGame(target);
      return;
    }
    case "!setlobby": {
      setLobby(target, userState, params);
      return;
    }
    case "!lobby": {
      getLobby(target);
      return;
    }
    case "!setrun": {
      setRun(target, userState, params);
      return;
    }
    case "!run": {
      getRun(target);
      return;
    }
    case "!shoutout":
    case "!so": {
      shoutout(target, userState, params);
      return;
    }
    case "!backlog": {
      getBacklog(target);
      return;
    }
    case "!addbacklog": {
      addBacklog(target, userState, params.join(" "));
      return;
    }
    case "!removebacklog": {
      removeBacklog(target, userState, params.join(" "));
      return;
    }
    case "!addcomm":
    case "!addcommand": {
      addCustomCommand(target, userState, params).catch((error: Error) => {
        tmiClient.say(target, error.message);
      });
      return;
    }
    case "!updatecomm":
    case "!updatecommand": {
      updateCustomCommand(target, userState, params).catch((error: Error) =>
        tmiClient.say(target, error.message)
      );
      return;
    }
    case "!removecomm":
    case "!removecommand": {
      removeCustomCommand(target, userState, params);
      return;
    }
    case "!whitelist": {
      addTermToWhitelist(target, userState, params);
      return;
    }
    case "!unwhitelist": {
      removeTermFromWhitelist(target, userState, params);
      return;
    }
    case "!blacklist": {
      addTermToBlacklist(target, userState, params);
      return;
    }
    case "!unblacklist": {
      removeTermFromBlacklist(target, userState, params);
      return;
    }
    default: {
      handleCustomCommands(target, userState, command, params);
      return;
    }
  }
}

export async function handleCustomCommands(
  target: string,
  userState: Userstate,
  bangCommand: string,
  params: string[]
) {
  const customCommands = await customCommandRegistry.getCommands(target);
  const command = bangCommand.substring(1);

  if (customCommands.filter((c) => c.name === command).length) {
    return;
  }

  const { behavior, response, modOnly, subOnly } = customCommands.filter(
    (c) => c.name === command
  )[0];

  if (modOnly && !isModerator(userState)) {
    return;
  }

  if (subOnly && (!isSubscriber(userState) || !isModerator(userState))) {
    return;
  }

  parseCustomCommand(target, command, behavior, response, params);
}

async function parseCustomCommand(
  target: string,
  command: string,
  behavior: string,
  response: string,
  params: string[]
) {
  switch (behavior) {
    case "respond": {
      tmiClient.say(target, response);
      return;
    }
    case "count": {
      if (params[0] === "+") {
        await customCommandRegistry.incrementCount(target, command, +params[1]);
      }

      if (params[0] === "-") {
        await customCommandRegistry.decrementCount(target, command, +params[1]);
      }

      const count = await customCommandRegistry.getCount(target, command);

      tmiClient.say(target, response.replace("%%", count.toString()));
      return;
    }
    case "timer": {
      tmiClient.say(target, response);
      return;
    }
    default: {
      return;
    }
  }
}
