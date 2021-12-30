import { useEffect, useState } from "react";
import CommandListItem from "../../components/Command/Command";
import AddNewCommandForm from "./AddNewCommandForm/AddNewCommandForm";

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

  useEffect(() => {
    loadCommands();
  }, [twitchUserInfo]);

  const loadCommands = () =>
    fetch(`/api/commands/${twitchUserInfo.username?.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => setCustomCommands(json));

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
        <button onClick={toggleAdding}>Add new Command</button>
      )}
      <ul>
        {isAddingCommand && (
          <li>
            <AddNewCommandForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </li>
        )}
        {customCommands.map((command) => (
          <CommandListItem
            username={twitchUserInfo.username!}
            {...command}
            removeCommand={handleRemoveCommand}
          />
        ))}
      </ul>
    </>
  );
}
