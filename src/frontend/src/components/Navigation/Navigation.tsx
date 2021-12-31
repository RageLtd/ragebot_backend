import { Link } from "react-router-dom";

import styles from "./Navigation.module.css";

export default function Navigation() {
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
      </ul>
    </nav>
  );
}
