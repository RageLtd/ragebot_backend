async function getFollowers(username: string) {}

interface FollowersViewProps {
  twitchUserInfo: {
    username?: string;
  };
}

export default function FollowersView({ twitchUserInfo }: FollowersViewProps) {
  return (
    <div>
      <h2>This is the follower dashboard</h2>
    </div>
  );
}
