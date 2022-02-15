import { Component, useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import RaffleEntryList from "./RaffleEntryList/RaffleEntryList";

interface RaffleViewProps {
  twitchUserInfo: {
    username?: string;
  };
}

interface RaffleViewState {
  raffleOpen: boolean;
  raffleEntries: string[];
  raffleWinner: string | undefined;
}

async function getRaffleState(username: string) {
  const res = await fetch(`/api/raffle/${username.toLowerCase()}/state`);
  const json = await res.json();
  return json.state;
}

async function getRaffleSSEStream(username: string) {
  if (process.env.NODE_ENV !== "production") {
    return new EventSource(
      `http://localhost:3001/api/raffle/${username.toLowerCase()}/feed`
    );
  }
  return new EventSource(`/api/raffle/${username.toLowerCase()}/feed`);
}

export default class RaffleView extends Component<
  RaffleViewProps,
  RaffleViewState
> {
  state = {
    raffleOpen: false,
    raffleEntries: [],
    raffleWinner: undefined,
  };
  raffleFeed: EventSource | undefined;

  constructor(props: RaffleViewProps) {
    super(props);
    this.raffleFeed = undefined;
  }

  componentDidMount() {
    const { twitchUserInfo } = this.props;
    if (twitchUserInfo.username) {
      getRaffleState(twitchUserInfo.username.toLowerCase()).then((res) =>
        this.setState({ raffleOpen: res })
      );
      getRaffleSSEStream(twitchUserInfo.username).then((res) => {
        res.onmessage = (ev) => {
          const parsed = JSON.parse(ev.data);
          if (parsed) {
            this.setState({
              raffleEntries: [...this.state.raffleEntries, ...parsed],
            });
          }
        };
        this.raffleFeed = res;
      });
    }
  }

  componentWillUnmount() {
    this.raffleFeed?.close();
  }

  openRaffle = () => {
    const { twitchUserInfo } = this.props;
    fetch(`/api/raffle/${twitchUserInfo.username?.toLowerCase()}/open`, {
      method: "POST",
    })
      .then(() => {
        this.setState({
          raffleOpen: true,
          raffleWinner: undefined,
        });
      })
      .catch(console.error);
  };

  closeRaffle = () => {
    const { twitchUserInfo } = this.props;
    fetch(`/api/raffle/${twitchUserInfo.username?.toLowerCase()}/close`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res: { winner: string }) => {
        this.setState({
          raffleOpen: false,
          raffleWinner: res.winner,
        });
      })
      .catch(console.error);
  };

  render() {
    const { raffleOpen, raffleEntries, raffleWinner } = this.state;

    return (
      <>
        <h1>Raffle</h1>
        <p>
          This page is where you control the current raffle for your channel.
          Press the <kbd>Open Raffle</kbd> button to open a raffle or enter (or
          have a moderator enter) <kbd>!raffle open</kbd> in chat. Once a raffle
          is open chatters can enter the raffle by typing <kbd>!raffle</kbd> in
          chat.
        </p>
        <h2>Status</h2>
        {raffleWinner && (
          <>
            <p>Raffle winner is:</p>
            <pre>{raffleWinner}</pre>
          </>
        )}
        {!raffleOpen && (
          <>
            <h3>No Raffle Open</h3>
            <p>Click</p>
            <Button weight="secondary" onClick={this.openRaffle}>
              Open Raffle
            </Button>
            <p>to open a new Raffle</p>
          </>
        )}
        {raffleOpen && <Button onClick={this.closeRaffle}>Pick Winner</Button>}
        {raffleOpen && <RaffleEntryList raffleEntries={raffleEntries} />}
      </>
    );
  }
}
