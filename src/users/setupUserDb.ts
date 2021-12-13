import { Collection } from "faunadb";
import { clientRegistry, faunaClient } from "..";
import { childDbExists } from "../commands/channels/clientRegistry";
import {
  createBaseCollectionQuery,
  createBaseIndexQuery,
  createUserChildDBQuery,
} from "./setupUserDbQueries";

export async function setupUserDb(username: string) {
  // TODO: Fix potential DB creation exploit
  if (await childDbExists(`#${username}`)) {
    return;
  }
  await faunaClient.query(createUserChildDBQuery(username));
  const client = await clientRegistry.getClient(`#${username}`);

  ["backlog", "commands", "counters", "game", "lobby", "run"].map(
    async (collection) => {
      console.info(
        `Creating collection ${collection} for new user: ${username}`
      );
      return await client?.query(createBaseCollectionQuery(collection));
    }
  );

  indexDefinitions.map(async (indexDefinition) => {
    console.info(`Creating new index ${indexDefinition.name} for ${username}`);
    return await client?.query(createBaseIndexQuery(indexDefinition));
  });
}

const indexDefinitions = [
  {
    name: "backlog_by_creation_asc",
    serialized: true,
    source: Collection("backlog"),
    values: [
      {
        field: ["data", "created"],
      },
      {
        field: ["ref"],
      },
    ],
  },
  {
    name: "backlog_by_name",
    unique: false,
    serialized: true,
    source: Collection("backlog"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "command_by_name",
    unique: false,
    serialized: true,
    source: Collection("commands"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "counter_by_command_name",
    unique: false,
    serialized: true,
    source: Collection("counters"),
    terms: [
      {
        field: ["data", "command"],
      },
    ],
  },
  {
    name: "games_by_creation_desc",
    serialized: true,
    source: Collection("game"),
    values: [
      {
        field: ["data", "created"],
        reverse: true,
      },
      {
        field: ["data", "name"],
      },
      {
        field: ["ref"],
      },
    ],
  },
  {
    name: "lobby_by_creation_desc",
    serialized: true,
    source: Collection("lobby"),
    values: [
      {
        field: ["data", "created"],
        reverse: true,
      },
      {
        field: ["data", "value"],
      },
      {
        field: ["ref"],
      },
    ],
  },
  {
    name: "run_by_creation_desc",
    serialized: true,
    source: Collection("run"),
    values: [
      {
        field: ["data", "created"],
        reverse: true,
      },
      {
        field: ["data", "value"],
      },
      {
        field: ["ref"],
      },
    ],
  },
];
