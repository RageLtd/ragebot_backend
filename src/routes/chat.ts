import { Router } from "express";
import path from "path";
import { readFileSync } from "fs";
import { getChatStyles } from "../chat/chat";

const chatRouter = Router();

chatRouter.get("/:userName", async (req, res) => {
  const chatPagePath = path.resolve(__dirname, "../../public/chat/layout.html");
  const chatPage = readFileSync(chatPagePath).toString();
  const endOfBodyIndex = chatPage.indexOf("</body>");

  const { userName } = req.params;
  const chatStyles = await getChatStyles(userName);

  const styleTag = `<style>${chatStyles}</style>`;

  res
    .status(200)
    .send(
      chatPage.substring(0, endOfBodyIndex) +
        styleTag +
        chatPage.substring(endOfBodyIndex)
    );
});

export default chatRouter;
