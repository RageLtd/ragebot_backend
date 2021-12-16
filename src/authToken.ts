import fetch from "cross-fetch";

const GET_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const VALIDATE_TOKEN_URL = "https://id.twitch.tv/oauth2/validate";

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

export async function getAuthToken() {
  if (authToken !== undefined && (await validateAuthToken(authToken))) {
    return authToken;
  }
  authToken = await retrieveAuthToken();
  return authToken;
}
