import { Router } from "express";
import { clientRegistry } from "..";
import {
  addBacklogQuery,
  getBacklogQuery,
  removeBacklogQuery,
  updateBacklogEntryQuery,
} from "../commands/backlog/backlogQueries";

const backlogApiRouter = Router();

backlogApiRouter.get(`/:userName`, async (req, res) => {
  const { userName } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const backlogRes = await client?.query(getBacklogQuery());

  res.send(backlogRes);
});

backlogApiRouter.post("/:userName", async (req, res) => {
  const { userName } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const { name, notes } = req.body;

  const backlogSaveRes = await client?.query(addBacklogQuery(name, notes));

  res.send(backlogSaveRes);
});

backlogApiRouter.patch("/:userName", async (req, res) => {
  const { userName } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const { name, notes } = req.body;

  const backlogUpdateRes = await client
    ?.query(updateBacklogEntryQuery(name, notes))
    .catch(console.error);

  res.send(backlogUpdateRes);
});

backlogApiRouter.delete("/:userName", async (req, res) => {
  const { userName } = req.params;
  const target = `#${userName.toLowerCase()}`;
  const client = await clientRegistry.getClient(target);

  const { name } = req.body;

  const backlogRemoveRes = await client?.query(removeBacklogQuery(name));

  res.send(backlogRemoveRes);
});

export default backlogApiRouter;
