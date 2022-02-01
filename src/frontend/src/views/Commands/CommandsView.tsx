import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import CommandListItem from "../../components/CommandListItem/CommandListItem";
import AddNewCommandForm from "./AddNewCommandForm/AddNewCommandForm";

import styles from "./CommandsView.module.css";

interface CommandsViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

export interface Command {
  [key: string]: any;
  id: string;
  name: string;
  behavior: string;
  subOnly: boolean;
  modOnly: boolean;
  response: string;
  isCaseSensitive: boolean;
  timeoutInMillis?: number;
}

export default function CommandsView({ twitchUserInfo }: CommandsViewProps) {
  const [customCommands, setCustomCommands] = useState<Command[]>([]);
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadCommands = () => {
    if (twitchUserInfo.username) {
      fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`)
        .then((res) => res.json())
        .then((json) => setCustomCommands(json));
    }
  };

  useEffect(() => {
    loadCommands();
  }, [twitchUserInfo]);

  const toggleAdding = () => setIsAddingCommand(!isAddingCommand);

  const handleSubmit = (command: Command) => {
    setIsSaving(true);
    fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    })
      .then(() => {
        setIsSaving(false);
        setIsAddingCommand(false);
        loadCommands();
      })
      .catch(console.error);
  };

  const handleCancel = () => setIsAddingCommand(false);

  const handleRemoveCommand = (command: Command) => {
    fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    })
      .then(() => loadCommands())
      .catch(console.error);
  };

  const generateHandleSetCommandEnabled =
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
    <>
      <h1>Commands</h1>
      <p>
        These are the custom commands you have registered on your channel. Here
        you can configure the behavior, response, timeout and even name of your
        custom commands.
      </p>
      <h2>Configuration</h2>
      {!isAddingCommand && (
        <Button onClick={toggleAdding}>Add new Command</Button>
      )}
      <ul className={styles.commandList}>
        {isAddingCommand && (
          <li className={styles.addNew}>
            <AddNewCommandForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </li>
        )}
        {customCommands
          .filter((command) => command.id !== "fake-id")
          .map((command) => {
            return (
              <CommandListItem
                key={command.id}
                username={twitchUserInfo.username!}
                {...command}
                removeCommand={handleRemoveCommand}
                setCommandEnabled={generateHandleSetCommandEnabled(command)}
              />
            );
          })}
      </ul>
    </>
  );
}
