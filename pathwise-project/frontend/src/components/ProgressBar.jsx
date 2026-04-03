import React from 'react'
import styles from './ProgressBar.module.css'

export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Overall Progress</span>
        <span className={styles.pct}>{pct}%</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.sub}>
        {completed} of {total} modules completed
      </div>
    </div>
  )
}
