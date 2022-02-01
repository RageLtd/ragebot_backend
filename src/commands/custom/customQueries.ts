import {
  Add,
  Collection,
  Create,
  CreateCollection,
  Delete,
  Documents,
  Equals,
  Get,
  If,
  Index,
  Lambda,
  Map,
  Match,
  Merge,
  Paginate,
  Select,
  Subtract,
  Take,
  Update,
  Var,
} from "faunadb";

export interface Timer {
  data: {
    command: string;
    timeoutInMillis: number;
  };
}

export interface TimersResponse {
  data: Timer[];
}

export interface Command {
  id: string;
  name: string;
  behavior: string;
  response: string;
  modOnly: boolean;
  subOnly: boolean;
  timeoutInMillis: number;
  isEnabled: boolean;
  isCaseSensitive: boolean;
}

export interface CommandResponse {
  data: Command[];
}

export interface Count {
  command: string;
  count: number;
}

export interface CountResponse {
  data: Count;
}

export const addCustomCommandQuery = ({
  id,
  name,
  behavior,
  modOnly,
  subOnly,
  timeoutInMillis,
  response,
  isCaseSensitive,
}: Command) =>
  Create(Collection("commands"), {
    data: {
      id,
      name,
      behavior,
      response,
      modOnly,
      subOnly,
      timeoutInMillis,
      isEnabled: true,
      isCaseSensitive,
    },
  });

export const updateCustomCommandByNameQuery = (
  name: string,
  behavior: string,
  modOnly: boolean,
  subOnly: boolean,
  timeoutInMillis: number,
  response: string,
  isEnabled: boolean
) =>
  Update(Select("ref", Get(Match(Index("command_by_name"), name))), {
    data: {
      behavior,
      modOnly,
      subOnly,
      timeoutInMillis,
      response,
      isEnabled,
    },
  });

export const updateCustomCommandByIdQuery = (command: {
  id: string;
  name: string;
  behavior: string;
  modOnly: boolean;
  subOnly: boolean;
  timeoutInMillis: number;
  response: string;
  isEnabled: boolean;
}) => {
  const { id, ...rest } = command;
  return Update(Select("ref", Get(Match(Index("command_by_id"), id))), {
    data: rest,
  });
};

export const removeCustomCommandByIdQuery = (command: Command) =>
  Map(
    Paginate(Match(Index("command_by_id"), command.id)),
    Lambda(["ref"], Delete(Var("ref")))
  );

export const removeCustomCommandByNameQuery = (command: string) =>
  Map(
    Paginate(Match(Index("command_by_name"), command)),
    Lambda(["ref"], Delete(Var("ref")))
  );

export const getCustomCommandsQuery = () =>
  Map(
    Paginate(Documents(Collection("commands"))),
    Lambda(["ref"], Select("data", Get(Var("ref"))))
  );

export const getCountQuery = (command: string) =>
  Get(Match(Index("counter_by_command_name"), command));

export const setCustomCounterQuery = (command: string, count: number = 0) =>
  Create(Collection("counters"), { data: { command, count } });

export const incrementCounterQuery = (command: string, count: number) =>
  Update(Select("ref", Get(Match(Index("counter_by_command_name"), command))), {
    data: {
      count: Add(
        Select(
          ["data", "count"],
          Get(Match(Index("counter_by_command_name"), command))
        ),
        count
      ),
    },
  });

export const decrementCounterQuery = (command: string, count: number) =>
  Update(Select("ref", Get(Match(Index("counter_by_command_name"), command))), {
    data: {
      count: Subtract(
        Select(
          ["data", "count"],
          Get(Match(Index("counter_by_command_name"), command))
        ),
        count
      ),
    },
  });

export const getDataByPageQuery = (
  command: string,
  { before, after }: { before?: string; after?: string }
) =>
  Paginate(Documents(Collection(`${command}_random`)), {
    before,
    after,
  });

export const createRandomCollection = (name: string) =>
  CreateCollection({ name: `${name}_random` });

export const addRandomDataQuery = (
  command: string,
  formattedParams: { value: string; notes?: string }
) => Create(Collection(`${command}_random`), { data: formattedParams });

export const getCommandsCustomBehaviorsQuery = (name: string) =>
  Map(
    Paginate(Match(Index("commands_custom_behaviors_by_command_name"), name)),
    Lambda("command", Select("data", Get(Var("command"))))
  );

export const saveCommandsCustomBehaviorQuery = (
  commandName: string,
  data: any
) =>
  Create(Collection("commands_custom_behaviors"), {
    data: { ...data, commandName },
  });

export const updateCommandsCustomBehaviorQuery = (
  commandName: string,
  {
    behaviorName,
    everyone,
    ...rest
  }: { behaviorName: string; everyone?: boolean }
) =>
  Map(
    Paginate(
      Match(Index("commands_custom_behaviors_by_command_name"), commandName)
    ),
    Lambda(
      "behavior",
      If(
        Equals(Select(["data", "name"], Get(Var("behavior"))), behaviorName),
        Update(Var("behavior"), { data: rest }),
        null
      )
    )
  );
