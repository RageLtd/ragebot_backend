import { merge } from "lodash";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import BacklogEntry from "../../components/BacklogEntry/BacklogEntry";
import Button from "../../components/Button/Button";

import styles from "./BacklogView.module.css";

interface BacklogViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

interface BacklogData {
  data?: BacklogItem[];
}

interface BacklogItem {
  name: string;
  notes: string;
}

export default function BacklogView({ twitchUserInfo }: BacklogViewProps) {
  const [backlog, setBacklog] = useState<BacklogData>({});
  const [isAddingBacklog, setIsAddingBacklog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");

  const getBacklog = () =>
    fetch(`/api/backlog/${twitchUserInfo.username?.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => setBacklog(json));

  useEffect(() => {
    if (twitchUserInfo.username) {
      getBacklog();
    }
  }, [twitchUserInfo.username]);

  const handleAddBacklogClick = () => setIsAddingBacklog(true);
  const handleAddToBacklog = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    fetch(`/api/backlog/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newItemName, notes: newItemNotes }),
    }).then(() => {
      setNewItemName("");
      setNewItemNotes("");
      setIsAddingBacklog(false);
      getBacklog();
    });
  };

  const generateUpdateEntry =
    (entry: BacklogItem) => (update: { name?: string; notes?: string }) => {
      fetch(`/api/backlog/${twitchUserInfo.username?.toLowerCase()}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(merge(entry, update)),
      }).then(() => {
        getBacklog();
      });
    };

  const removeEntry = (item: BacklogItem) => {
    fetch(`/api/backlog/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    }).then(() => {
      getBacklog();
    });
  };
  const handleNewItemNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewItemName(e.target.value);
  const handleNewItemNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setNewItemNotes(e.target.value);

  const cancelAddItem = () => {
    setNewItemName("");
    setNewItemNotes("");
    setIsAddingBacklog(false);
  };

  return (
    <>
      <h1>Backlog</h1>
      <p>
        Here you can manage games in your backlog (or to-play queue). This is
        accessible in chat via the <span className={styles.code}>!backlog</span>{" "}
        command.
      </p>
      <Button onClick={handleAddBacklogClick}>Add Game to Backlog</Button>
      <ol>
        {isAddingBacklog && (
          <li>
            <form onSubmit={handleAddToBacklog}>
              <label>
                Name:{" "}
                <input
                  type="text"
                  value={newItemName}
                  onChange={handleNewItemNameChange}
                />
              </label>
              <label>
                Notes:
                <textarea
                  value={newItemNotes}
                  onChange={handleNewItemNotesChange}
                ></textarea>
              </label>
              <Button weight="secondary" type="submit">
                Add to Backlog
              </Button>
              <Button onClick={cancelAddItem}>Cancel</Button>
            </form>
          </li>
        )}
        {backlog.data &&
          backlog.data.map((entry) => (
            <BacklogEntry
              key={`${entry.name + entry.notes}`}
              {...entry}
              saveProperty={generateUpdateEntry(entry)}
              remove={removeEntry}
            />
          ))}
      </ol>
    </>
  );
}
