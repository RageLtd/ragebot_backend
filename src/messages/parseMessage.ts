import { Client, Get } from "faunadb";
import { Userstate } from "tmi.js";
import { clientRegistry, customCommandRegistry, tmiClient } from "..";
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
  addRandomDataQuery,
  getCommandsCustomBehaviorsQuery,
  getDataByPageQuery,
} from "../commands/custom/customQueries";
import {
  getGame,
  getLobby,
  getRun,
  setGame,
  setLobby,
  setRun,
} from "../commands/game/game";
import { shoutout } from "../commands/shoutout";
import { disableBot } from "../commands/utils";
import {
  executeCustomBehavior,
  timeoutInMillis,
} from "../notifications/notificationUtils";
import { notification_sse_clients } from "../ragebotServer";
import { userHasPermission } from "../utils/permissioning";
import {
  addTermToBlacklist,
  addTermToWhitelist,
  removeTermFromBlacklist,
  removeTermFromWhitelist,
} from "./whitelist";

interface FaunaResponse {
  data: any[];
  after?: string;
  before?: string;
}

interface RandomResult {
  data: {
    value: string;
    notes: string;
  };
}

export function parseMessage(
  target: string,
  userState: Userstate,
  message: string
) {
  const messageArr = message.split(" ");
  const command = messageArr.shift()!;
  const params = messageArr;

  switch (command.toLowerCase()) {
    case "!off":
    case "!disable": {
      disableBot(target);
      return;
    }
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
  const customBehaviors: { [key: string]: any[] } = {};
  const client = await clientRegistry.getClient(target);
  await Promise.all(
    Object.values(customCommands)
      .reduce((acc: string[], command) => {
        acc.push(command.name);
        return acc;
      }, [])
      .map(async (type) => {
        const { data: behaviors } = (await client?.query(
          getCommandsCustomBehaviorsQuery(type)
        )) as { data: any[] };
        customBehaviors[type] = behaviors;
      })
  );
  const command = bangCommand.substring(1);

  if (customCommands.filter((c) => c.name === command).length === 0) {
    return;
  }

  const { behavior, response, modOnly, subOnly, isEnabled } =
    customCommands.filter((c) => c.name === command)[0];

  if (!userHasPermission(userState, { modOnly, subOnly })) {
    return;
  }

  if (!isEnabled) {
    return;
  }

  if (customBehaviors[command] && customBehaviors[command].length > 0) {
    customBehaviors[command].forEach(async (behavior) => {
      if (!userHasPermission(userState, behavior)) {
        return;
      }

      const message = await executeCustomBehavior(
        client!,
        target.substring(1),
        behavior,
        "",
        { user_name: userState.username! },
        params.join(" ")
      );
      notification_sse_clients[target.substring(1)]?.forEach((sse_client) => {
        sse_client.res.write(
          `data: ${JSON.stringify({
            notificationHTML: message,
            timeoutInMillis,
            type: "command",
            alertName: command,
          })}\n\n`
        );
      });
    });
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
  if (command.startsWith("add") && behavior === "respond") {
    await addRandomData(target, command, params);
    tmiClient.say(target, response);
  }
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
    case "random": {
      const randomResult = await parseRandomCommand(target, command);

      const formattedResult = `${randomResult.data.value} - ${randomResult.data.notes}`;

      tmiClient.say(target, formattedResult);
      return;
    }
    default: {
      return;
    }
  }
}

async function getAllData(
  target: string,
  command: string,
  client: Client,
  { after }: { after?: string }
): Promise<any[]> {
  const firstRes = (await client?.query(
    getDataByPageQuery(command, { after })
  )) as FaunaResponse;

  const allData = [];

  allData.push(...firstRes.data);

  if (firstRes.after) {
    const newData = await getAllData(target, command, client, {
      after: firstRes.after,
    });
    allData.push(...newData);
  }

  return allData;
}

async function parseRandomCommand(
  target: string,
  command: string
): Promise<RandomResult> {
  const client = await clientRegistry.getClient(target);

  const allResult = await getAllData(target, command, client!, {});

  const randomIndex = Math.floor(Math.random() * allResult.length);

  const result = (await client?.query(
    Get(allResult[randomIndex])
  )) as RandomResult;

  return result;
}

async function addRandomData(
  target: string,
  command: string,
  params: string[]
) {
  const client = await clientRegistry.getClient(target);

  const splitParams = params.join(" ").split(/\||\-|:/gm);
  const formattedParams = {
    value: splitParams.shift()!,
    notes: splitParams.shift(),
  };
  await client?.query(
    addRandomDataQuery(command.substring(3).toLowerCase(), formattedParams)
  );
}
