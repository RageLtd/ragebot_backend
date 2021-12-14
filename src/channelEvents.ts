import { Get, Database } from "faunadb";
import { faunaClient } from ".";
import { subscriptionTypes } from "./subscriptionTypes";
import fetch from "cross-fetch";

const SUBSCRIPTION_URL = "https://api.twitch.tv/helix/eventsub/subscriptions";
const GET_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const VALIDATE_TOKEN_URL = "https://id.twitch.tv/oauth2/validate";

interface Database {
  data: {
    [key: string]: string;
  };
}

let authToken: string;

async function validateAuthToken(authToken: string) {
  const res = await fetch(VALIDATE_TOKEN_URL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return res.ok;
}

async function retrieveAuthToken() {
  let urlWithParameters = new URL(GET_TOKEN_URL);
  urlWithParameters.searchParams.set(
    "client_id",
    process.env.TWITCH_CLIENT_ID!
  );
  urlWithParameters.searchParams.set(
    "client_secret",
    process.env.TWITCH_SECRET!
  );
  urlWithParameters.searchParams.set("grant_type", "client_credentials");

  const res = await fetch(urlWithParameters.toString(), {
    method: "post",
  });

  const { access_token } = await res.json();

  return access_token;
}

async function getAuthToken() {
  if (authToken !== undefined && (await validateAuthToken(authToken))) {
    return authToken;
  }
  authToken = await retrieveAuthToken();
  return authToken;
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
