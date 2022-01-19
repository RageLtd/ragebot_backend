import { Collection } from "faunadb";

export default [
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
  {
    name: "whitelist_by_value",
    unique: false,
    serialized: true,
    source: Collection("filter_whitelist"),
    terms: [
      {
        field: ["data", "value"],
      },
    ],
  },
  {
    name: "blacklist_by_value",
    unique: false,
    serialized: true,
    source: Collection("filter_blacklist"),
    terms: [
      {
        field: ["data", "value"],
      },
    ],
  },
  {
    name: "webhook_by_name",
    unique: false,
    serialized: true,
    source: Collection("webhooks"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "command_by_id",
    unique: false,
    serialized: true,
    source: Collection("commands"),
    terms: [
      {
        field: ["data", "id"],
      },
    ],
  },
  {
    name: "channel_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("channel_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "cheer_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("cheer_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "follow_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("follow_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "new_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("new_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "raid_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("raid_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "redemption_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("redemption_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "resub_custom_behaviors_by_name",
    unique: false,
    serialized: true,
    source: Collection("resub_custom_behaviors"),
    terms: [
      {
        field: ["data", "name"],
      },
    ],
  },
  {
    name: "commands_custom_behaviors_by_command_name",
    unique: false,
    serialized: true,
    source: Collection("commands_custom_behaviors"),
    terms: [
      {
        field: ["data", "commandName"],
      },
    ],
  },
];
