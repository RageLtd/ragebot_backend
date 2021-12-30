import { clientRegistry, registeredChannels } from "../..";
import { handleCustomCommands } from "../../messages/parseMessage";
import {
  Command,
  CommandResponse,
  CountResponse,
  decrementCounterQuery,
  getCountQuery,
  getCustomCommandsQuery,
  incrementCounterQuery,
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

    return data;
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
