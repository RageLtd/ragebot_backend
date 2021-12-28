import crypto from "crypto";
import { Request, Response } from "express";
import { sendNotification } from "../notifications/notifications";

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

export const handleEventSubPost = (req: Request, res: Response) => {
  // const message = getHMACMessage(req);
  // const hmac = HMAC_PREFIX + getHMAC(secret!, message);

  const notification = req.body;

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

      console.info(`${notification.subscription.type} notifications revoked!`);
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
};

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
