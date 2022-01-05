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

  return (
    <>
      <h1>This is the commands view</h1>
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
        {customCommands.map((command) => (
          <CommandListItem
            key={command.id}
            username={twitchUserInfo.username!}
            {...command}
            removeCommand={handleRemoveCommand}
          />
        ))}
      </ul>
    </>
  );
}
