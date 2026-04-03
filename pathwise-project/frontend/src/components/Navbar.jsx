import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar({ onNewPath }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <div className={styles.logoIcon}>🧭</div>
        <span className={styles.logoName}>Path<span>Wise</span></span>
      </div>
      <div className={styles.right}>
        {user && (
          <div className={styles.userChip}>
            <span className={styles.userAvatar}>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
            <span className={styles.userName}>{user.name || 'Student'}</span>
          </div>
        )}
        {onNewPath && (
          <button className={styles.newBtn} onClick={onNewPath}>
            + New Path
          </button>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}
