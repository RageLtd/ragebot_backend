import Follower, { FollowerProps } from "./Follower/Follower";

interface FollowerListProps {
  followerList?: FollowerProps[];
}

export default function FollowerList({ followerList = [] }: FollowerListProps) {
  return (
    <ol>
      {followerList.map((follower) => (
        <Follower key={follower.from_id} {...follower} />
      ))}
    </ol>
  );
}
