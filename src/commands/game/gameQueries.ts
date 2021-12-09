import { Get, Match, Index, Create, Collection, Now } from "faunadb";

export interface GameResponse {
  data: {
    name: string;
  };
}

export interface LobbyResponse {
  data: {
    value: string;
  };
}

export interface RunResponse {
  data: {
    value: string;
  };
}

export const getCurrentGameQuery = () =>
  Get(Match(Index("games_by_creation_desc")));

export const setCurrentGameQuery = (name: string) =>
  Create(Collection("game"), {
    data: {
      name,
      created: Now(),
    },
  });

export const getCurrentLobbyQuery = () =>
  Get(Match(Index("lobby_by_creation_desc")));

export const setCurrentLobbyQuery = (value: string) =>
  Create(Collection("lobby"), {
    data: {
      value,
      created: Now(),
    },
  });

export const getCurrentRunQuery = () =>
  Get(Match(Index("run_by_creation_desc")));

export const setCurrentRunQuery = (value: string) =>
  Create(Collection("run"), {
    data: {
      value,
      created: Now(),
    },
  });
