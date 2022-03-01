import { Router } from "express";
import { faunaClient } from "..";
import {
  getIsUserBotEnabledStateQuery,
  setUserBotEnabledStateQuery,
} from "../users/userQueries";

interface BotStateResponse {
  data: {
    botEnabledState: boolean;
  };
}

const ragebotRouter = Router();

ragebotRouter.get("/state/:userName", async (req, res) => {
  const { userName } = req.params;

  const botState = await faunaClient
    .query(getIsUserBotEnabledStateQuery(`#${userName.toLowerCase()}`))
    .catch(console.error);

  res.send(botState);
});

ragebotRouter.post("/state/:userName", async (req, res) => {
  const { userName } = req.params;

  const {
    data: { botEnabledState },
  } = (await faunaClient
    .query(
      setUserBotEnabledStateQuery(
        `#${userName.toLowerCase()}`,
        req.body.botEnabledState
      )
    )
    .catch(console.error)) as BotStateResponse;

  res.send(botEnabledState);
});

export default ragebotRouter;
