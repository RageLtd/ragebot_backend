import { v4 as uuidv4 } from "uuid";

import { clientRegistry, registeredChannels } from "../..";
import { handleCustomCommands } from "../../messages/parseMessage";
import {
  addCustomCommandQuery,
  Command,
  CommandResponse,
  CountResponse,
  createRandomCollection,
  decrementCounterQuery,
  getCountQuery,
  getCustomCommandsQuery,
  incrementCounterQuery,
  removeCustomCommandByIdQuery,
  updateCustomCommandByIdQuery,
} from "./customQueries";

interface CommandRegistry {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

interface TimerRegistry {
  [key: string]: {
    [key: string]: NodeJS.Timer;
  };
}

export class CustomCommandRegistry {
  commandRegistry: CommandRegistry = {};
  timerRegistry: TimerRegistry = {};

  constructor() {
    registeredChannels.forEach((channel) => {
      this.refreshCommands(`#${channel}`);
    });
  }

  async getCommands(target: string) {
    const client = await clientRegistry.getClient(target);
    const { data } = (await client?.query(
      getCustomCommandsQuery()
    )) as CommandResponse;

    return data.reduce((acc: Command[], command: Command) => {
      acc.push(command);
      if (command.behavior === "random") {
        acc.push({
          id: "fake-id",
          name: `add${command.name}`,
          behavior: "respond",
          response: `${command.name} added`,
          modOnly: true,
          subOnly: false,
          timeoutInMillis: 0,
          isEnabled: command.isEnabled,
        });
      }
      return acc;
    }, []);
  }

  async addCommand(
    target: string,
    { name, behavior, modOnly, subOnly, timeoutInMillis, response }: Command
  ) {
    const client = await clientRegistry.getClient(target);

    const id = uuidv4();

    const res = await client
      ?.query(
        addCustomCommandQuery(
          id,
          name,
          behavior,
          modOnly,
          subOnly,
          timeoutInMillis,
          response
        )
      )
      .catch(console.error);

    if (behavior === "random") {
      await client?.query(createRandomCollection(name)).catch(console.error);
    }
    return res;
  }

  async removeCommand(target: string, command: Command) {
    const client = await clientRegistry.getClient(target);

    const res = await client
      ?.query(removeCustomCommandByIdQuery(command))
      .catch(console.error);

    return res;
  }

  async updateCommand(target: string, command: Command) {
    const client = await clientRegistry.getClient(target).catch(console.error);
    const res = await client
      ?.query(updateCustomCommandByIdQuery(command))
      .catch(console.error);

    await this.refreshCommands(target);

    return res;
  }

  async refreshCommands(target: string) {
    const client = await clientRegistry.getClient(target);

    const { data } = (await client?.query(
      getCustomCommandsQuery()
    )) as CommandResponse;

    this.commandRegistry[target] = data.reduce(
      (
        acc: { [key: string]: { [key: string]: any } },
        { name, ...commandAttributes }: Command
      ) => {
        acc[name] = { ...commandAttributes };
        return acc;
      },
      {}
    );

    this.setTimers(target);
  }

  setTimers(target: string) {
    // Clean up dangling timers
    Object.values(this.timerRegistry).map((channel) =>
      Object.values(channel).map((timer) => clearInterval(timer))
    );

    this.timerRegistry[target] = Object.keys(this.commandRegistry[target] || {})
      .filter(
        (command) => this.commandRegistry[target][command].behavior === "timer"
      )
      .reduce((timers: { [key: string]: NodeJS.Timer }, command) => {
        timers[command] = setInterval(
          handleCustomCommands,
          Number(this.commandRegistry[target][command].timeoutInMillis),
          target,
          { mod: true },
          `!${command}`,
          []
        );
        return timers;
      }, {});
  }

  disableTimers(target: string) {
    Object.values(this.timerRegistry[target]).map((timer) =>
      clearInterval(timer)
    );
  }

  async getCount(target: string, command: string) {
    const client = await clientRegistry.getClient(target);

    const { data } = (await client?.query(
      getCountQuery(command)
    )) as CountResponse;

    return data.count;
  }

  async incrementCount(target: string, command: string, value: number = 1) {
    const client = await clientRegistry.getClient(target);

    return await client?.query(incrementCounterQuery(command, value));
  }

  async decrementCount(target: string, command: string, value: number = 1) {
    const client = await clientRegistry.getClient(target);

    return await client?.query(decrementCounterQuery(command, value));
  }
}
