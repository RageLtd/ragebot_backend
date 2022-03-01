import { Router } from "express";
import { webhookRegistry } from "..";

const integrationsApiRouter = Router();

integrationsApiRouter.get("/:userName", async (req, res) => {
  const { userName } = req.params;

  res
    .status(200)
    .send(
      await webhookRegistry.getWebhookUrls(`#${userName}`).catch(console.error)
    );
});

integrationsApiRouter.patch("/:userName", async (req, res) => {
  const { userName } = req.params;
  const faunaRes = await webhookRegistry
    .updateWebhook(userName, req.body)
    .catch(console.error);

  /// @ts-expect-error
  res.send(faunaRes?.data);
});

integrationsApiRouter.post("/:userName", async (req, res) => {
  const { userName } = req.params;
  const saveRes = await webhookRegistry
    .addWebhook(userName, req.body)
    .catch(console.error);

  res.send(saveRes);
});

integrationsApiRouter.delete("/:userName", async (req, res) => {
  const { userName } = req.params;
  const removeRes = await webhookRegistry
    .removeWebhook(userName, req.body)
    .catch(console.error);

  res.send(removeRes);
});

export default integrationsApiRouter;
