import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navBrand}>
        CodersCommunity
      </Link>
      <div className={styles.navLinks}>
        <NavLink to="/contests" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
          Contests
        </NavLink>
        <NavLink to="/leaderboard" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
          Leaderboard
        </NavLink>
        {user ? (
          <>
            <NavLink to={`/profile/${user.username}`} className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
              My Profile
            </NavLink>
            <button onClick={logout} className={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Login</NavLink>
            <NavLink to="/register" className={({isActive}) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;