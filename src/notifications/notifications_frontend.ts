function initializeNotifications(body: HTMLBodyElement) {
  const notificationContainer = document.createElement("div");
  notificationContainer.id = "notification-container";

  body.append(notificationContainer);
}

const parser = new DOMParser();

const { search } = window.location;

const notificationTypes =
  search.indexOf("?") > -1
    ? search.substring(search.indexOf("=") + 1).split(",")
    : [];

const notificationQueue: any[] = [];

function createNotification(parsed: any) {
  const notification = document.createElement("div");
  notification.classList.add("notification");

  notification.append(
    ...parser.parseFromString(parsed.notificationHTML, "text/html").body
      .children
  );

  return notification;
}

let queueCheckInterval: NodeJS.Timer;

document.addEventListener("DOMContentLoaded", () => {
  initializeNotifications(document.querySelector("body")!);

  const messageSource = new EventSource(`/api${window.location.pathname}/feed`);

  messageSource.onmessage = (message) => {
    const parsed = JSON.parse(message.data);
    if (
      notificationTypes.length > 0 &&
      !notificationTypes.includes(parsed.type)
    ) {
      return;
    }

    const timeoutInMillis = parsed.timeoutInMillis;

    const notificationContainer = document.querySelector(
      "#notification-container"
    );

    const notification = createNotification(parsed);

    const readFromQueue = () => {
      const newNotification = notificationQueue.shift();
      if (newNotification) {
        notificationContainer?.append(newNotification);

        setTimeout(() => {
          newNotification.remove();
        }, timeoutInMillis);
      }
    };

    notificationQueue.push(notification);

    if (queueCheckInterval === undefined) {
      queueCheckInterval = setInterval(readFromQueue, timeoutInMillis * 1.1);
    }
  };
});
