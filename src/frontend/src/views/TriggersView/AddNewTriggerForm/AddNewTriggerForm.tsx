import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";

interface AddNewTriggerFormProps {
  onSubmit: Function;
  onCancel: Function;
}

export default function AddNewTriggerForm({
  onSubmit,
  onCancel,
}: AddNewTriggerFormProps) {
  const [keyword, setKeyword] = useState("");

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setKeyword(e.target.value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSubmit({ keyword });
  };

  const handleCancel = () => {
    setKeyword("");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>New Trigger</h3>
      <label>
        Keyword
        <Input helper="What word would you like the Trigger to activate on?">
          <input type="text" value={keyword} onChange={handleKeywordChange} />
        </Input>
      </label>
      <Button weight="secondary" type="submit">
        Save
      </Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </form>
  );
}
