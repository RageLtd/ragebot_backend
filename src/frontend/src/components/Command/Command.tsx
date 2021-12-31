import { MouseEvent } from "react";
import { Command } from "../../views/Commands/CommandsView";
import EditableProperty from "../EditableProperty/EditableProperty";

interface CommandListItemProps extends Command {
  username: string;
  removeCommand: Function;
}

export default function CommandListItem({
  username,
  removeCommand,
  ...command
}: CommandListItemProps) {
  const saveProperty = (property: { name: string; value: any }) => {
    console.log(
      JSON.stringify({
        ...command,
        [property.name]: property.value,
      })
    );
    fetch(`/api/commands/${username}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...command,
        [property.name]: property.value,
      }),
    });
  };

  const handleRemoveClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // eslint-disable-next-line
    if (confirm(`Are you sure you want to delete "${command.name}?"`)) {
      removeCommand(command);
    }
  };

  return (
    <li>
      <div>
        {Object.keys(command).map((property) => {
          if (property !== "id") {
            return (
              <EditableProperty
                name={property}
                value={command[property]}
                save={saveProperty}
              />
            );
          }
          return <></>;
        })}
      </div>
      <button onClick={handleRemoveClick}>Delete Command</button>
    </li>
  );
}