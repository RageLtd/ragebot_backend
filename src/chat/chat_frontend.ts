function initializeChat(body: HTMLBodyElement) {
  const chatContainer = document.createElement("ol");
  chatContainer.id = "chat-container";

  body.append(chatContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeChat(document.querySelector("body")!);

  const messageSource = new EventSource(
    `//${window.location.host}${window.location.pathname}/feed`
  );

  messageSource.onmessage = (message) => {
    const chatContainer = document.querySelector("#chat-container");
    const chatMessageContainer = document.createElement("li");

    const parser = new DOMParser();
    const parsed = parser.parseFromString(message.data, "text/html");
    chatMessageContainer.append(
      parsed.querySelector(".identity")!,
      parsed.querySelector(".message")!
    );

    chatContainer?.append(chatMessageContainer);
    chatContainer?.lastElementChild?.scrollIntoView();
  };
});
