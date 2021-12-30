import {
  Add,
  Collection,
  Create,
  Delete,
  Documents,
  Get,
  Index,
  Lambda,
  Map,
  Match,
  Paginate,
  Select,
  Subtract,
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

export const addCustomCommandQuery = (
  id: string,
  name: string,
  behavior: string,
  modOnly: boolean,
  subOnly: boolean,
  timeoutInMillis: number,
  response: string
) =>
  Create(Collection("commands"), {
    data: {
      id,
      name,
      behavior,
      response,
      modOnly,
      subOnly,
      timeoutInMillis,
    },
  });

export const updateCustomCommandByNameQuery = (
  name: string,
  behavior: string,
  modOnly: boolean,
  subOnly: boolean,
  timeoutInMillis: number,
  response: string
) =>
  Update(Select("ref", Get(Match(Index("command_by_name"), name))), {
    data: {
      behavior,
      modOnly,
      subOnly,
      timeoutInMillis,
      response,
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
}) => {
  const { id, ...rest } = command;
  return Update(Select("ref", Get(Match(Index("command_by_id"), id))), {
    data: rest,
  });
};

export const removeCustomCommandQuery = (command: string) =>
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
