import { formatDistance } from "date-fns";

import styles from "./Follower.module.css";

export interface FollowerProps {
  from_name: string;
  followed_at: string;
  from_id: string;
}

export default function Follower({ from_name, followed_at }: FollowerProps) {
  const followedDate = new Date(Date.parse(followed_at));
  return (
    <li className={styles.container}>
      <h2>{from_name}</h2>
      <dl>
        <dt>Follower Since</dt>
        <dd>{followedDate.toLocaleString()}</dd>
        <dt>Time Followed</dt>
        <dd>{formatDistance(new Date(), followedDate)}</dd>
      </dl>
    </li>
  );
}
