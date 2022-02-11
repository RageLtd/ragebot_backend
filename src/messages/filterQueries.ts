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
  Database,
  Update,
} from "faunadb";

export interface WhitelistResponse {
  data: string[];
  after?: any[];
}

export interface BlacklistResponse {
  data: string[];
  after?: any[];
}

export const getWhitelistQuery = (after?: any) =>
  Map(
    Paginate(Documents(Collection("filter_whitelist")), { after }),
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

export const getBlacklistQuery = (after?: any) =>
  Map(
    Paginate(Documents(Collection("filter_blacklist")), { after }),
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

export const setUsingDefaultBlocklistQuery = (
  username: string,
  value: boolean
) => Update(Database(username), { data: { useDefaultBlocklist: value } });

export const getUsingDefaultBlocklistQuery = (username: string) =>
  Get(Database(username));
