import { CreateCollection, CreateDatabase, CreateIndex } from "faunadb";

export const createUserChildDBQuery = (name: string, twitchId: string) =>
  CreateDatabase({ name, data: { twitchId } });

export const createBaseCollectionQuery = (name: string) =>
  CreateCollection({ name });

export const createBaseIndexQuery = (config: { [key: string]: any }) =>
  CreateIndex(config);
