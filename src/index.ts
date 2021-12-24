import { Client, Delete } from "faunadb";
import tmi, { Userstate } from "tmi.js";

import { getAllChannelsQuery } from "./commands/channels/channelQueries";
import { parseMessage } from "./messages/parseMessage";
import { ClientRegistry } from "./commands/channels/clientRegistry";
import { CustomCommandRegistry } from "./commands/custom/customRegistry";
import { clearInterval } from "timers";
import { initializeRagebotServer } from "./ragebotServer";
import { initializeTwitchWebhook } from "./twitchWebhook";
import { subscribeChannelEvents } from "./channelEvents";
import { ChatFilterRegistry } from "./messages/filterRegistry";
import { messageHandler } from "./messageHandler";

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

getAllChannels().then((rawChannels) => {
  registeredChannels = rawChannels.data.map((channel) =>
    channel.data.name.toLowerCase()
  );

  clientRegistry = new ClientRegistry();
  customCommandRegistry = new CustomCommandRegistry();
  filterRegistry = new ChatFilterRegistry();

  initialize();
});

async function initialize() {
  tmiClient = new tmi.Client({
    options: { debug: true },
    connection: {
      secure: true,
    },
    identity: {
      username: "ragebotltd",
      password: process.env.TMI_SECRET,
    },
    channels: registeredChannels,
  });

  tmiClient.connect().catch(console.error);

  tmiClient.on("message", messageHandler);

  initializeRagebotServer();
  initializeTwitchWebhook();

  subscribeChannelEvents(registeredChannels);
}

process.once("SIGUSR2", async () => {
  // Clean up all dangling client keys on exit
  await Promise.all(
    Object.values(clientRegistry.clients).map(async (client) => {
      await faunaClient.query(Delete(client.ref));
    })
  );

  // Clean up dangling timers
  Object.values(customCommandRegistry.timerRegistry).map((channel) =>
    Object.values(channel).map((timer) => clearInterval(timer))
  );

  process.kill(process.pid, "SIGUSR2");
});
