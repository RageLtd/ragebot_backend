import { CreateCollection, CreateDatabase, CreateIndex } from "faunadb";

export const createUserChildDBQuery = (name: string) =>
  CreateDatabase({ name });

export const createBaseCollectionQuery = (name: string) =>
  CreateCollection({ name });

export const createBaseIndexQuery = (config: { [key: string]: any }) =>
  CreateIndex(config);
