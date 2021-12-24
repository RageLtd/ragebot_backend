import express, { Request } from "express";
import crypto from "crypto";
import helmet from "helmet";
import { sendNotification } from "./notifications/notifications";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log("Env variables loaded");
}

const webhookPort = process.env.WEBHOOK_PORT;

const secret = process.env.WEBHOOK_SECRET;

// Notification request headers
const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id".toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  "Twitch-Eventsub-Message-Timestamp".toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  "Twitch-Eventsub-Message-Signature".toLowerCase();
const MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
const MESSAGE_TYPE_NOTIFICATION = "notification";
const MESSAGE_TYPE_REVOCATION = "revocation";

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = "sha256=";

export function initializeTwitchWebhook() {
  const twitchWebhook = express();

  twitchWebhook.use(
    express.raw({
      type: "application/json",
    })
  );

  twitchWebhook.use(helmet());

  twitchWebhook.post("/eventsub", (req, res) => {
    const message = getHMACMessage(req);
    const hmac = HMAC_PREFIX + getHMAC(secret!, message);

    if (verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE])) {
      const notification = JSON.parse(req.body);

      switch (req.headers[MESSAGE_TYPE]) {
        case MESSAGE_TYPE_NOTIFICATION: {
          sendNotification(notification);
          res.sendStatus(204);
          break;
        }
        case MESSAGE_TYPE_VERIFICATION: {
          res
            .header("Content-Type", "text/plain")
            .status(200)
            .send(notification.challenge);
          break;
        }
        case MESSAGE_TYPE_REVOCATION: {
          res.sendStatus(204);

          console.info(
            `${notification.subscription.type} notifications revoked!`
          );
          console.info(`reason: ${notification.subscription.status}`);
          console.info(
            `condition: ${JSON.stringify(
              notification.subscription.condition,
              null,
              4
            )}`
          );
          break;
        }
        default: {
          res.sendStatus(204);
          console.info(
            `Unknown message type received: ${req.headers[MESSAGE_TYPE]}`
          );
        }
      }
    } else {
      res.sendStatus(403);
    }
  });

  twitchWebhook.listen(webhookPort, () => {
    console.info(`Twitch Webhook running on port ${webhookPort}`);
  });
}

function getHMACMessage(request: Request) {
  return (
    (request.headers[TWITCH_MESSAGE_ID] as string) +
    request.headers[TWITCH_MESSAGE_TIMESTAMP] +
    request.body
  );
}

function getHMAC(secret: string, message: string) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function verifyMessage(hmac: string, verifySignature: any) {
  if (!verifySignature) {
    console.error("No signature to verify");
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(verifySignature)
  );
}
