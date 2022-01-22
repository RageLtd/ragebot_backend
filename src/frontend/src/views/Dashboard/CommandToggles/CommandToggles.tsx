import { useEffect, useState } from "react";
import Toggle from "../../../components/Toggle/Toggle";
import { Command } from "../../Commands/CommandsView";

import styles from "./CommandToggles.module.css";

interface CommandTogglesProps {
  twitchUserInfo: {
    username?: string;
  };
}

export default function CommandToggles({
  twitchUserInfo,
}: CommandTogglesProps) {
  const [commands, setCommands] = useState<Command[]>([]);

  const loadCommands = () => {
    if (twitchUserInfo.username) {
      fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`)
        .then((res) => res.json())
        .then((json) => setCommands(json));
    }
  };

  useEffect(() => {
    if (twitchUserInfo.username) {
      loadCommands();
    }
  }, [twitchUserInfo.username]);

  const generateHandleToggleCommand =
    (command: Command) => async (isEnabled: boolean) => {
      await fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...command,
          isEnabled,
        }),
      });
      loadCommands();
    };

  return (
    <div className={styles.container}>
      <h4>Commands</h4>
      <ul className={styles.commandList}>
        {commands
          .filter((command) => command.id !== "fake-id")
          .map((command) => (
            <li className={styles.commandItem} key={command.id}>
              {command.name}{" "}
              <Toggle
                onChange={generateHandleToggleCommand(command)}
                state={command.isEnabled}
              >
                {command.isEnabled ? "On" : "Off"}
              </Toggle>
            </li>
          ))}
      </ul>
    </div>
  );
}
