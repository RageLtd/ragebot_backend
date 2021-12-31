import { Router } from "express";
import { webhookRegistry } from "..";

const integrationsApiRouter = Router();

integrationsApiRouter.get("/:userName", async (req, res) => {
  const { userName } = req.params;

  res.status(200).send(await webhookRegistry.getWebhookUrls(`#${userName}`));
});

integrationsApiRouter.patch("/:userName", async (req, res) => {
  const { userName } = req.params;
  const faunaRes = await webhookRegistry.updateWebhook(userName, req.body);

  /// @ts-expect-error
  res.send(faunaRes?.data);
});

export default integrationsApiRouter;
