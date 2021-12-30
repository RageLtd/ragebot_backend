function initializeNotifications(body: HTMLBodyElement) {
  const notificationContainer = document.createElement("div");
  notificationContainer.id = "notification-container";

  body.append(notificationContainer);
}

const parser = new DOMParser();

document.addEventListener("DOMContentLoaded", () => {
  initializeNotifications(document.querySelector("body")!);

  const messageSource = new EventSource(
    `//${window.location.host}/api${window.location.pathname}/feed`
  );

  messageSource.onmessage = (message) => {
    const parsedMessage = JSON.parse(message.data);
    const timeoutInMillis = parsedMessage.timeoutInMillis;

    const notificationContainer = document.querySelector(
      "#notification-container"
    );

    const notification = document.createElement("div");
    notification.classList.add("notification");

    notification.append(
      ...parser.parseFromString(parsedMessage.notificationHTML, "text/html")
        .body.children
    );

    notificationContainer?.append(notification);

    setTimeout(() => notification.remove(), timeoutInMillis);
  };
});
