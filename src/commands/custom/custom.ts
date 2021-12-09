import { Userstate } from "tmi.js";
import { clientRegistry, customCommandRegistry, tmiClient } from "../..";
import { isModerator } from "../../messages/isModerator";
import { setCommand, setCustomCounter, updateCommand } from "../utils";
import { removeCustomCommandQuery } from "./customQueries";

const allowedCommandBehaviors = ["count", "respond", "timer"];

export async function addCustomCommand(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    const modOnly = params[params.length - 1].toLowerCase() === "modonly";
    const subOnly = params[params.length - 1].toLowerCase() === "subonly";

    if (modOnly || subOnly) {
      params.pop();
    }

    const [name, behavior, ...response] = params;
    let timeoutInMillis: number = 0;

    if (!allowedCommandBehaviors.includes(behavior)) {
      throw new Error("Behavior must be 'count', 'timer' or 'respond'");
    }

    if (behavior === "timer") {
      const timeoutInMinutes = response.shift()!;

      if (isNaN(Number(timeoutInMinutes))) {
        throw new Error(
          "Syntax for registering timers is '!addcomm <name> timer <timeout in minutes> response'"
        );
      }

      timeoutInMillis = Number(timeoutInMinutes) * 60 * 1000;
    }

    if (behavior === "count") {
      await setCustomCounter(target, name);
    }

    await setCommand(
      target,
      name,
      behavior,
      modOnly,
      subOnly,
      timeoutInMillis,
      response.join(" ")
    );
    await customCommandRegistry.refreshCommands(target);
    tmiClient.say(target, `${name} command added`);
  }
}

export async function updateCustomCommand(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    const modOnly = params[params.length - 1].toLowerCase() === "modonly";
    const subOnly = params[params.length - 1].toLowerCase() === "subonly";

    if (modOnly || subOnly) {
      params.pop();
    }

    const [name, behavior, ...response] = params;
    let timeoutInMillis: number = 0;

    if (!allowedCommandBehaviors.includes(behavior)) {
      throw new Error("Behavior must be 'count', 'timer' or 'respond'");
    }

    if (behavior === "timer") {
      const timeoutInMinutes = response.shift()!;

      if (isNaN(Number(timeoutInMinutes))) {
        throw new Error(
          "Syntax for registering timers is '!addcomm <name> timer <timeout in minutes> response'"
        );
      }

      timeoutInMillis = Number(timeoutInMinutes) * 60 * 1000;
    }

    if (behavior === "count") {
      await setCustomCounter(target, name);
    }

    await updateCommand(
      target,
      name,
      behavior,
      modOnly,
      subOnly,
      timeoutInMillis,
      response.join(" ")
    );
    await customCommandRegistry.refreshCommands(target);
    tmiClient.say(target, `${name} command updated`);
  }
}

export async function removeCustomCommand(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    const command = params[0];

    const client = await clientRegistry.getClient(target);

    const removed = (await client?.query(
      removeCustomCommandQuery(command)
    )) as any;

    await customCommandRegistry.refreshCommands(target);

    tmiClient.say(target, `${removed.data[0].data.name} command removed`);
  }
}
