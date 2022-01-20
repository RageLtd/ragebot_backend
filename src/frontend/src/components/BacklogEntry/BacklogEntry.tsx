import Button from "../Button/Button";
import EditableProperty from "../EditableProperty/EditableProperty";

interface BacklogEntryProps {
  name: string;
  notes: string;
  remove: Function;
  saveProperty: Function;
}

export default function BacklogEntry({
  name,
  notes,
  remove,
  saveProperty,
}: BacklogEntryProps) {
  const handleRemove = () => remove({ name, notes });
  const handleSaveProperty = ({
    name,
    value,
  }: {
    name: string;
    value: string;
  }) =>
    saveProperty({
      [name]: value,
    });
  return (
    <li>
      <dl>
        <dt>Name</dt>
        <dd>
          <EditableProperty
            name="name"
            value={name}
            save={handleSaveProperty}
          />
        </dd>

        <details>
          <EditableProperty
            name="notes"
            value={notes}
            save={handleSaveProperty}
          />
        </details>

        <Button weight="danger" onClick={handleRemove}>
          Remove
        </Button>
      </dl>
    </li>
  );
}
