import { Database, Get, Select, Update } from "faunadb";

export const setUserBotEnabledStateQuery = (
  target: string,
  botEnabledState: boolean
) => Update(Database(target.substring(1)), { data: { botEnabledState } });

export const getIsUserBotEnabledStateQuery = (target: string) =>
  Select(["data", "botEnabledState"], Get(Database(target.substring(1))));
