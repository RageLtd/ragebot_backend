import { Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { getNotificationStyles } from "../notifications/notificationUtils";

const notificationsRouter = Router();

notificationsRouter.get("/:userName", async (req, res) => {
  const notificationPagePath = path.resolve(
    __dirname,
    "../../public/notifications/layout.html"
  );
  const notificationPage = readFileSync(notificationPagePath).toString();
  const endOfBodyIndex = notificationPage.indexOf("</body>");

  const { userName } = req.params;
  const notificationStyles = await getNotificationStyles(userName);

  console.log(notificationStyles);

  const styleTag = `<style>${notificationStyles}</style>`;

  res
    .status(200)
    .header("Feature-Policy", "autoplay *")
    .send(
      notificationPage.substring(0, endOfBodyIndex) +
        styleTag +
        notificationPage.substring(endOfBodyIndex)
    );
});

export default notificationsRouter;
