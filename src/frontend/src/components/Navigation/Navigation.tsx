import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import styles from "./Navigation.module.css";

export default function Navigation() {
  const { logout } = useAuth0();
  const handleLogout = () => logout({ returnTo: window.location.origin });
  return (
    <nav className={styles.nav}>
      <ul>
        <li className={styles.navItem}>
          <Link to="/">Dashboard</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/commands">Commands</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/integrations">Integrations</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/followers">Followers</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/backlog">Backlog</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/notifications">Notifications</Link>
        </li>
      </ul>
      <div>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}
