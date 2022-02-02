import {
  Component,
  createElement,
  createRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 } from "uuid";
import { SingleEntryPlugin } from "webpack";

import styles from "./DashboardChat.module.css";

export function attributesToProps(element: Element) {
  return Array.from(element.attributes).reduce(
    (acc: { [key: string]: any }, attribute) => {
      if (attribute.name === "class") {
        acc.className = attribute.value;
      } else if (attribute.name === "disabled" && attribute.value === "") {
        acc.disabled = true;
      } else if (attribute.name === "style") {
        acc.style = attribute.value
          .split(";")
          .reduce((acc: { [key: string]: string }, v) => {
            const [property, value] = v.split(":");
            acc[property] = value;
            return acc;
          }, {});
      } else {
        acc[attribute.name] = attribute.value;
      }

      return acc;
    },
    {}
  );
}

export function parseChildren(element: Element) {
  return Array.from(element.childNodes).reduce((acc: JSX.Element[], child) => {
    if (child.nodeName === "#text") {
      acc.push(<span key={v4()}>{child.textContent}</span>);
    } else if (child.nodeName === "IMG") {
      acc.push(
        createElement((child as Element).tagName.toLowerCase(), {
          key: v4(),
          ...attributesToProps(child as Element),
        })
      );
    } else {
      acc.push(
        createElement((child as Element).tagName.toLowerCase(), {
          key: v4(),
          ...attributesToProps(child as Element),
          children: parseChildren(child as Element),
        })
      );
    }

    return acc;
  }, []);
}

interface DashboardChatProps {
  twitchUserInfo: {
    username?: string;
  };
}

async function getChatFeed(username: string) {
  if (process.env.NODE_ENV !== "production") {
    return new EventSource(
      `http://localhost:3001/api/chat/${username.toLowerCase()}/feed`
    );
  }
  return new EventSource(`/api/chat/${username.toLowerCase()}/feed`);
}

const parser = new DOMParser();

export default class DashboardChat extends Component<
  DashboardChatProps,
  { chatEntries: JSX.Element[]; highWater: string | undefined }
> {
  chatFeed: EventSource | undefined;
  chatWindow = createRef<HTMLDivElement>();
  state = {
    chatEntries: [] as JSX.Element[],
    highWater: undefined,
  };

  constructor(props: DashboardChatProps) {
    super(props);
    this.chatFeed = undefined;
  }

  componentDidMount() {
    getChatFeed(this.props.twitchUserInfo.username!).then((res) => {
      res.onmessage = (event: MessageEvent) => {
        const { body } = parser.parseFromString(event.data, "text/html");
        const entryDom: JSX.Element[] = [];
        body.childNodes.forEach((e) => {
          const reactEntry = createElement(
            (e as Element).tagName.toLowerCase(),
            { ...attributesToProps(e as Element), key: v4() },
            parseChildren(e as Element)
          );
          entryDom.push(reactEntry);
        });
        this.appendChatMessage(entryDom);
      };
      this.chatFeed = res;
    });
  }

  generateSetHighWater(id: string) {
    return () => {
      this.setState({ highWater: id });
    };
  }

  appendChatMessage(entryDom: JSX.Element[]) {
    const trimmedChatEntries = this.state.chatEntries.slice(0, 98);
    const id = v4();
    if (this.state.chatEntries.length === 0) {
      this.setState({
        highWater: id,
      });
    }
    this.setState({
      chatEntries: [
        ...trimmedChatEntries,
        <div id={id} onClick={this.generateSetHighWater(id)}>
          {entryDom}
        </div>,
      ],
    });
    this.chatWindow.current?.scrollTo({
      top: this.chatWindow.current.scrollHeight,
    });
  }

  render() {
    const { chatEntries } = this.state;
    return (
      <>
        <h4>Chattychat</h4>
        <div ref={this.chatWindow} className={styles.chatContainer}>
          {chatEntries.map((Entry) => {
            if (Entry.props.id === this.state.highWater) {
              return (
                <Entry.type className={styles.highWater} {...Entry.props} />
              );
            }
            return Entry;
          })}
        </div>
      </>
    );
  }
}
