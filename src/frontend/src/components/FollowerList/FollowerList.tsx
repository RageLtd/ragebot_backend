import Follower, { FollowerProps } from "./Follower/Follower";
import styles from "./FollowerList.module.css";

interface FollowerListProps {
  followerList?: FollowerProps[];
}

export default function FollowerList({ followerList = [] }: FollowerListProps) {
  return (
    <ol className={styles.list}>
      {followerList.map((follower) => (
        <Follower key={follower.from_id} {...follower} />
      ))}
    </ol>
  );
}
