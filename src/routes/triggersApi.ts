import { Router } from "express";
import { clientRegistry } from "..";
import {
  createTriggerCustomBehaviorQuery,
  deleteTriggerQuery,
  getTriggerCustomBehaviorsQuery,
  getTriggersQuery,
  saveNewTriggerQuery,
  updateTriggerCustomBehaviorQuery,
} from "../triggers/triggerQueries";

const triggersApiRouter = Router();

triggersApiRouter.get("/:userName", async (req, res) => {
  const { userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const triggersRes = await client
    ?.query(getTriggersQuery())
    .catch(console.error);

  res.send(triggersRes);
});

triggersApiRouter.post("/:userName", async (req, res) => {
  const { userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const saveTriggerRes = await client?.query(saveNewTriggerQuery(req.body));

  res.send(saveTriggerRes);
});

triggersApiRouter.delete("/:userName/:keyword", async (req, res) => {
  const { keyword, userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const deleteTriggerRes = await client?.query(deleteTriggerQuery(keyword));

  res.send(deleteTriggerRes);
});

triggersApiRouter.post("/:userName/behaviors/:keyword", async (req, res) => {
  const { keyword, userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const createRes = await client
    ?.query(createTriggerCustomBehaviorQuery(keyword, req.body))
    .catch(console.error);

  res.send(createRes);
});

triggersApiRouter.patch("/:userName/behaviors/:keyword", async (req, res) => {
  const { keyword, userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName.toLowerCase()}`);

  const createRes = await client
    ?.query(updateTriggerCustomBehaviorQuery(keyword, req.body))
    .catch(console.error);

  res.send(createRes);
});

triggersApiRouter.get("/:userName/behaviors/:keyword", async (req, res) => {
  const { keyword, userName } = req.params;
  const client = await clientRegistry
    .getClient(`#${userName.toLowerCase()}`)
    .catch(console.error);

  const getRes = await client
    ?.query(getTriggerCustomBehaviorsQuery(keyword))
    .catch(console.error);

  res.send({ data: getRes });
});

export default triggersApiRouter;
