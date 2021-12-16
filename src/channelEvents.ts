import { Get, Database } from "faunadb";
import { faunaClient } from ".";
import { subscriptionTypes } from "./subscriptionTypes";
import fetch from "cross-fetch";
import { getAuthToken } from "./authToken";

const SUBSCRIPTION_URL = "https://api.twitch.tv/helix/eventsub/subscriptions";

interface Database {
  data: {
    [key: string]: string;
  };
}

export async function subscribeChannelEvents(registeredChannels: string[]) {
  registeredChannels.forEach(async (channel) => {
    if (channel === "#ragebotld") return;

    const database = (await faunaClient.query(
      Get(Database(channel.substring(1)))
    )) as Database;

    const broadcaster_user_id = database.data.user_id.split("|").pop();
    const authToken = await getAuthToken();

    await Promise.all(
      subscriptionTypes.map(
        async (subscriptionType) =>
          await fetch(SUBSCRIPTION_URL, {
            method: "post",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: subscriptionType,
              version: "1",
              condition: {
                broadcaster_user_id,
                to_broadcaster_user_id: broadcaster_user_id,
              },
              transport: {
                method: "webhook",
                callback: process.env.WEBHOOK_CALLBACK_URL,
                secret: process.env.WEBHOOK_SECRET,
              },
            }),
          })
      )
    );
  });
}
