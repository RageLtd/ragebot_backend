import { Route, Routes } from "react-router-dom";
import { useAuth0, User, withAuthenticationRequired } from "@auth0/auth0-react";
import DashboardView from "./views/Dashboard/Dashboard";
import Followers from "./views/Followers/Followers";
import { useEffect, useState } from "react";
import { setupUserDb } from "./views/utils/setupUserDb";
import { userDbExists } from "./views/utils/user";
import IntegrationsView from "./views/Integrations/IntegrationsView";
import CommandsView from "./views/Commands/CommandsView";
import Navigation from "./components/Navigation/Navigation";
import styles from "./App.module.css";
import BacklogView from "./views/BacklogView/BacklogView";
import NotificationsView from "./views/NotificationsView/NotificationsView";

function App() {
  const { isAuthenticated, user, isLoading, error, getAccessTokenSilently } =
    useAuth0();
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isUserCreating, setIsUserCreating] = useState(false);

  const isApplicationLoading = () => {
    return isLoading || isUserLoading || isUserCreating;
  };

  const [twitchUserInfo, setTwitchUserInfo] = useState({
    username: undefined,
    user_id: undefined,
  });

  useEffect(() => {
    setIsUserLoading(true);
    const audience = process.env.REACT_APP_AUTH0_MANAGEMENT_AUDIENCE;
    const getUserInfoByEmail = async (user: User) => {
      const token = await getAccessTokenSilently({
        audience,
        scope: "openid profile",
      });

      return await fetch(
        `${audience}users/${user.sub}?fields=username,user_id&include_fields=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    };

    if (isAuthenticated) {
      getUserInfoByEmail(user!)
        .then((res) => res.json())
        .then((user) => {
          setTwitchUserInfo({
            ...user,
            user_id: user.user_id.split("|").pop(),
          });
          return { ...user, user_id: user.user_id.split("|").pop() };
        })
        .then(async (user) => {
          if (!(await userDbExists(user.username).catch(console.error))) {
            setIsUserCreating(true);
            await setupUserDb(user.username, user.user_id).catch(console.error);
            setIsUserCreating(false);
            return;
          }
          return;
        })
        .then(() => {
          setIsUserLoading(false);
        })
        .catch(console.error);
    }
  }, [getAccessTokenSilently, user, isAuthenticated]);

  function loader(Component: any) {
    return (loading: boolean, props: any) => {
      if (loading) {
        return <div>loading</div>;
      }
      return <Component {...props} />;
    };
  }
  const routes = (
    <div className={styles.wrapper}>
      <Routes>
        <Route
          path="/"
          element={loader(DashboardView)(isApplicationLoading(), {
            twitchUserInfo,
          })}
        />
        <Route
          path="/followers"
          element={loader(Followers)(isApplicationLoading(), {
            twitchUserInfo,
          })}
        />
        <Route
          path="/integrations"
          element={loader(IntegrationsView)(isApplicationLoading(), {
            twitchUserInfo,
          })}
        />
        <Route
          path="/commands"
          element={loader(CommandsView)(isApplicationLoading(), {
            twitchUserInfo,
          })}
        />
        <Route
          path="/backlog"
          element={loader(BacklogView)(isApplicationLoading(), {
            twitchUserInfo,
          })}
        />
        <Route
          path="/notifications"
          element={loader(NotificationsView)(isApplicationLoading(), {
            twitchUserInfo,
          })}
        />
      </Routes>
    </div>
  );

  if (error && process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  let content;

  if (isApplicationLoading()) {
    content = (
      <>
        <h3>Loading...</h3>
        {routes}
      </>
    );
  } else if (error) {
    content = (
      <>
        <p>Something broke! {error.message}</p>
        <p>{JSON.stringify(error)}</p>
        {routes}
      </>
    );
  } else if (isAuthenticated) {
    content = <>{routes}</>;
  }

  return (
    <div className={styles.App}>
      <Navigation />
      {content}
    </div>
  );
}

export default withAuthenticationRequired(App);
