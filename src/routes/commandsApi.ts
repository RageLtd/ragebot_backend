import { Router } from "express";
import { clientRegistry, customCommandRegistry } from "..";
import {
  getCommandsCustomBehaviorsQuery,
  saveCommandsCustomBehaviorQuery,
  updateCommandsCustomBehaviorQuery,
} from "../commands/custom/customQueries";

const commandsApiRouter = Router();

commandsApiRouter.get("/:userName", async (req, res) => {
  const { userName } = req.params;

  const commandRes = await customCommandRegistry.getCommands(`#${userName}`);

  res.status(200).send(commandRes);
});

commandsApiRouter.patch("/:userName", async (req, res) => {
  const { userName } = req.params;

  const commandRes = await customCommandRegistry.updateCommand(
    `#${userName.toLowerCase()}`,
    req.body
  );

  /// @ts-expect-error
  res.send(commandRes.data);
});

commandsApiRouter.post("/:userName", async (req, res) => {
  const { userName } = req.params;

  const commandRes = await customCommandRegistry
    .addCommand(`#${userName.toLowerCase()}`, req.body)
    .catch((err) => res.send(err));

  await customCommandRegistry.refreshCommands(`#${userName.toLowerCase()}`);

  res.send(commandRes);
});

commandsApiRouter.delete("/:userName", async (req, res) => {
  const { userName } = req.params;

  const commandRes = await customCommandRegistry
    .removeCommand(`#${userName.toLowerCase()}`, req.body)
    .catch(console.error);

  res.send(commandRes);
});

commandsApiRouter.get("/:userName/behaviors/:commandName", async (req, res) => {
  const { commandName, userName } = req.params;
  const client = await clientRegistry.getClient(`#${userName}`);

  const behaviorsResponse = await client
    ?.query(getCommandsCustomBehaviorsQuery(commandName))
    .catch(console.error);

  res.send(behaviorsResponse);
});

commandsApiRouter.post(
  "/:userName/behaviors/:commandName",
  async (req, res) => {
    const { commandName, userName } = req.params;
    const client = await clientRegistry.getClient(`#${userName}`);

    const saveResponse = await client
      ?.query(saveCommandsCustomBehaviorQuery(commandName, req.body))
      .catch(console.error);

    res.send(saveResponse);
  }
);

commandsApiRouter.patch(
  "/:userName/behaviors/:commandName",
  async (req, res) => {
    const { commandName, userName } = req.params;
    const client = await clientRegistry.getClient(`#${userName}`);

    const saveResponse = await client
      ?.query(updateCommandsCustomBehaviorQuery(commandName, req.body))
      .catch(console.error);

    res.send(saveResponse);
  }
);

export default commandsApiRouter;
