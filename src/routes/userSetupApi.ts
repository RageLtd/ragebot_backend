import { Router } from "express";
import { childDbExists } from "../clientRegistry";
import { setupUserDb } from "../users/setupUserDb";

const userSetupApiRouter = Router();

userSetupApiRouter.get("/", async (req, res) => {
  const { username } = req.query;

  const exists = await childDbExists(`#${username}`).catch(console.error);

  if (exists) {
    res.sendStatus(200);
    return;
  }
  res.sendStatus(404);
});

userSetupApiRouter.post("/", async (req, res) => {
  await setupUserDb(req.body.username.toLowerCase(), req.body.user_id);
  res.sendStatus(200);
});

export default userSetupApiRouter;
