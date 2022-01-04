import Button from "../Button/Button";
import EditableValue from "../EditableProperty/EditableProperty";

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
          <EditableValue name="name" value={name} save={handleSaveProperty} />
        </dd>

        <details>
          <dt>Notes</dt>
          <dd>
            <EditableValue
              name="notes"
              value={notes}
              save={handleSaveProperty}
            />
          </dd>
        </details>

        <Button weight="danger" onClick={handleRemove}>
          Remove
        </Button>
      </dl>
    </li>
  );
}
