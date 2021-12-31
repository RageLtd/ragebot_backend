import { Link } from "react-router-dom";

import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/commands">Commands</Link>
        </li>
        <li>
          <Link to="/integrations">Integrations</Link>
        </li>
        <li>
          <Link to="/commands">Commands</Link>
        </li>
        <li>watcha</li>
      </ul>
    </nav>
  );
}
