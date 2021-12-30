import { useEffect, useState } from "react";
import CommandListItem from "../../components/Command/Command";

interface CommandsViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

export interface Command {
  [key: string]: string | boolean | number | undefined;
  id: string;
  name: string;
  behavior: string;
  subOnly: boolean;
  modOnly: boolean;
  response: string;
  timeoutInMillis?: number;
}

export default function CommandsView({ twitchUserInfo }: CommandsViewProps) {
  const [customCommands, setCustomCommands] = useState<Command[]>([]);

  useEffect(() => {
    fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => setCustomCommands(json));
  }, [twitchUserInfo]);

  return (
    <>
      <h1>This is the commands view</h1>
      <ul>
        {customCommands.map((command) => (
          <CommandListItem username={twitchUserInfo.username!} {...command} />
        ))}
      </ul>
    </>
  );
}
