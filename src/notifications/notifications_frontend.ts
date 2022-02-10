function initializeNotifications(body: HTMLBodyElement) {
  const notificationContainer = document.createElement("div");
  notificationContainer.id = "notification-container";

  body.append(notificationContainer);
}

const parser = new DOMParser();

const audioContext = new AudioContext();

const { search } = window.location;

const notificationTypes =
  search.indexOf("?") > -1
    ? search.substring(search.indexOf("=") + 1).split(",")
    : [];

const notificationQueue: Element[] = [];

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

let isNotificationShowing: boolean;

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
        const audioNode = newNotification.querySelector("audio");
        notificationContainer?.append(newNotification);
        isNotificationShowing = true;
        if (parsed.speech.speak) {
          const utterance = new SpeechSynthesisUtterance(parsed.speech.message);
          utterance.voice = parsed.speech.voice
            ? window.speechSynthesis
                .getVoices()
                .find((v) => v.name === parsed.speech.voice)!
            : null;
          window.speechSynthesis.speak(utterance);
        }
        if (audioNode !== null) {
          audioNode.play();
        }
        setTimeout(() => {
          newNotification.remove();
          isNotificationShowing = false;
          setTimeout(readFromQueue, timeoutInMillis * 0.1);
        }, timeoutInMillis);
      }
    };

    if (isNotificationShowing) {
      notificationQueue.push(notification);
    } else {
      const audioNode = notification.querySelector("audio");
      notificationContainer?.append(notification);
      if (parsed.speech.speak) {
        const utterance = new SpeechSynthesisUtterance(parsed.speech.message);
        utterance.voice = parsed.speech.voice
          ? window.speechSynthesis
              .getVoices()
              .find((v) => v.name === parsed.speech.voice)!
          : null;
        window.speechSynthesis.speak(utterance);
      }
      isNotificationShowing = true;
      if (audioNode !== null) {
        audioNode.play();
      }
      setTimeout(() => {
        notification.remove();
        isNotificationShowing = false;
        setTimeout(readFromQueue, timeoutInMillis * 0.1);
      }, timeoutInMillis);
    }
  };
});
