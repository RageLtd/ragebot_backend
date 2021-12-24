import { useEffect, useState } from "react";
import { FollowerProps } from "../../components/FollowerList/Follower/Follower";
import FollowerList from "../../components/FollowerList/FollowerList";

async function getFollowers(user_id: string, cursor?: string) {
  let followerList = await fetch(
    `http://${window.location.hostname}:${8081}/follows?user_id=${user_id}${
      cursor ? `&after=${cursor}` : ""
    }`
  ).then((res) => res.json());

  let moreFollowers: FollowerListInterface = { data: [] };

  if (followerList.pagination.cursor) {
    moreFollowers = await getFollowers(user_id, followerList.pagination.cursor);
  }

  return {
    ...followerList,
    data: [...followerList.data, ...moreFollowers.data],
    pagination: moreFollowers.pagination,
  };
}

interface FollowersViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

interface FollowerListInterface {
  pagination?: {
    cursor?: string;
  };
  data: FollowerProps[];
}

export default function FollowersView({ twitchUserInfo }: FollowersViewProps) {
  const [followerList, setFollowerList] = useState<FollowerListInterface>();

  useEffect(() => {
    const getTheDamnFollowers = async () =>
      setFollowerList(await getFollowers(twitchUserInfo.user_id!));

    getTheDamnFollowers();
  }, [twitchUserInfo.user_id]);

  return (
    <div>
      <h2>This is the follower dashboard</h2>
      <h3>List of followers</h3>
      <FollowerList followerList={followerList?.data} />
    </div>
  );
}
