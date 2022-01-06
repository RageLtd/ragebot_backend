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

document.addEventListener("DOMContentLoaded", () => {
  initializeNotifications(document.querySelector("body")!);

  const messageSource = new EventSource(
    `//${window.location.host}/api${window.location.pathname}/feed`
  );

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

    const notification = document.createElement("div");
    notification.classList.add("notification");

    notification.append(
      ...parser.parseFromString(parsed.notificationHTML, "text/html").body
        .children
    );

    notificationContainer?.append(notification);

    setTimeout(() => notification.remove(), timeoutInMillis);
  };
});
