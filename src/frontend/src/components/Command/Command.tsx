import { Command } from "../../views/Commands/CommandsView";
import EditableProperty from "../EditableProperty/EditableProperty";

interface CommandListItemProps extends Command {
  username: string;
}

export default function CommandListItem({
  username,
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

  const removeProperty = (property: { name: string; value: any }) => {
    console.log(property);
  };

  return (
    <li>
      {Object.keys(command).map((property) => {
        if (property !== "id") {
          return (
            <EditableProperty
              name={property}
              value={command[property]}
              save={saveProperty}
              remove={removeProperty}
            />
          );
        }
        return <></>;
      })}
    </li>
  );
}
