export interface FollowerProps {
  from_name: string;
  followed_at: string;
  from_id: string;
}

export default function Follower({ from_name, followed_at }: FollowerProps) {
  return (
    <li>
      {from_name} - {new Date(Date.parse(followed_at)).toLocaleString()}
    </li>
  );
}
