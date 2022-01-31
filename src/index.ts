import { Client, Delete } from "faunadb";
import tmi from "tmi.js";

import { getAllChannelsQuery } from "./commands/channels/channelQueries";
import { ClientRegistry } from "./clientRegistry";
import { CustomCommandRegistry } from "./commands/custom/customRegistry";
import { clearInterval } from "timers";
import { initializeRagebotServer } from "./ragebotServer";
import { subscribeChannelEvents } from "./channelEvents";
import { ChatFilterRegistry } from "./messages/filterRegistry";
import { messageHandler } from "./messageHandler";
import { WebhookRegistry } from "./webhooks/webhookRegistry";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export let webPort = Number(process.env.PORT);

export let tmiClient: tmi.Client;

interface Channel {
  data: {
    name: string;
    target: string;
  };
}

interface ChannelList {
  data: Channel[];
}

const secret = process.env.FAUNA_KEY;

if (typeof secret === "undefined" || secret === "") {
  console.error("The FAUNADB_SECRET environment variable is not set, exiting.");
  process.exit(1);
}

export const faunaClient = new Client({
  secret,
  domain: "db.us.fauna.com",
  port: 443,
  scheme: "https",
});

async function getAllChannels() {
  return faunaClient.query(getAllChannelsQuery) as Promise<ChannelList>;
}

export let registeredChannels: string[];

export let customCommandRegistry: CustomCommandRegistry;

export let clientRegistry: ClientRegistry;

export let filterRegistry: ChatFilterRegistry;

export let webhookRegistry: WebhookRegistry;

getAllChannels().then((rawChannels) => {
  registeredChannels = rawChannels.data.map((channel) =>
    channel.data.name.toLowerCase()
  );

  console.log("registered channels", registeredChannels);

  clientRegistry = new ClientRegistry();
  customCommandRegistry = new CustomCommandRegistry();
  filterRegistry = new ChatFilterRegistry();
  webhookRegistry = new WebhookRegistry();

  initialize();
});

async function initialize() {
  console.log("registered channels", registeredChannels);

  tmiClient = new tmi.Client({
    options: { debug: process.env.NODE_ENV !== "production" },
    connection: {
      secure: true,
    },
    identity: {
      username: "ragebotltd",
      password: process.env.TMI_SECRET,
    },
    channels: registeredChannels,
  });

  tmiClient.on("message", messageHandler);

  initializeRagebotServer();

  if (process.env.NODE_ENV === "production") {
    tmiClient.connect().catch(console.error);
    subscribeChannelEvents(registeredChannels);
  }
}

const doCleanup = () => {
  // Clean up all dangling client keys on exit
  Promise.all(
    Object.values(clientRegistry.clients).map(async (client) => {
      await faunaClient.query(Delete(client.ref));
    })
  )
    .then(() => {
      Object.values(customCommandRegistry.timerRegistry).map((channel) =>
        Object.values(channel).map((timer) => clearInterval(timer))
      );
    })
    .finally(() => {
      process.exit(0);
    });
};

["SIGUSR2", "SIGTERM", "SIGINT"].forEach((signal) =>
  process.on(signal, doCleanup)
);
