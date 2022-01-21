import {
  Documents,
  Collection,
  Map,
  Lambda,
  Get,
  Paginate,
  Var,
  Select,
  Create,
  Delete,
  Match,
  Index,
  Let,
  If,
  Exists,
} from "faunadb";

export interface WhitelistResponse {
  data?: string[];
}

export interface BlacklistResponse {
  data?: string[];
}

export const getWhitelistQuery = () =>
  Map(
    Paginate(Documents(Collection("filter_whitelist"))),
    Lambda(["value"], Select(["data", "value"], Get(Var("value"))))
  );

export const addToWhitelistQuery = (value: string) =>
  Let(
    { entry: Exists(Match(Index("whitelist_by_value"), value)) },
    If(
      Var("entry"),
      null,
      Create(Collection("filter_whitelist"), {
        data: {
          value,
        },
      })
    )
  );

export const removeFromWhitelistQuery = (value: string) =>
  Delete(Select("ref", Get(Match(Index("whitelist_by_value"), value))));

export const getBlacklistQuery = () =>
  Map(
    Paginate(Documents(Collection("filter_blacklist"))),
    Lambda(["value"], Select(["data", "value"], Get(Var("value"))))
  );

export const addToBlacklistQuery = (value: string) =>
  Let(
    { entry: Exists(Match(Index("blacklist_by_value"), value)) },
    If(
      Var("entry"),
      null,
      Create(Collection("filter_blacklist"), {
        data: {
          value,
        },
      })
    )
  );

export const removeFromBlacklistQuery = (value: string) =>
  Delete(Select("ref", Get(Match(Index("blacklist_by_value"), value))));
