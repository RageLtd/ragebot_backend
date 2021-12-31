import { Router } from "express";
import fetch from "cross-fetch";
import { getAuthToken } from "../authToken";
import { TWITCH_HELIX_API } from "../ragebotServer";

const followRouter = Router();

followRouter.get("/", async (req, res) => {
  const { user_id, after } = req.query;

  const authToken = await getAuthToken();

  const twitchRes = await fetch(
    `${TWITCH_HELIX_API}/users/follows?to_id=${user_id}${
      after ? `&after=${after}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      },
    }
  );

  res.status(twitchRes.status).send(await twitchRes.json());
});

export default followRouter;
