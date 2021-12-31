import { Router } from "express";
import { customCommandRegistry } from "..";

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

  res.send(commandRes);
});

commandsApiRouter.delete("/:userName", async (req, res) => {
  const { userName } = req.params;

  const commandRes = await customCommandRegistry
    .removeCommand(`#${userName.toLowerCase()}`, req.body)
    .catch(console.error);

  res.send(commandRes);
});

export default commandsApiRouter;
