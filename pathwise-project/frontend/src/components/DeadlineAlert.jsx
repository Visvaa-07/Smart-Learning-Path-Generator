import React from 'react'
import styles from './DeadlineAlert.module.css'

export default function DeadlineAlert({ totalWeeks, deadlineWeeks, isOverloaded }) {
  if (!deadlineWeeks) {
    return (
      <div className={styles.alertNeutral}>
        <span className={styles.alertIcon}>🗓</span>
        <div>
          <div className={styles.alertTitle}>No deadline set</div>
          <div className={styles.alertSub}>Estimated completion: {totalWeeks} weeks</div>
        </div>
      </div>
    )
  }

  const weeksLeft = deadlineWeeks - totalWeeks

  if (isOverloaded || weeksLeft < 0) {
    return (
      <div className={styles.alertDanger}>
        <span className={styles.alertIcon}>⚠️</span>
        <div>
          <div className={styles.alertTitle}>Deadline at risk!</div>
          <div className={styles.alertSub}>
            Need {totalWeeks}w but deadline is {deadlineWeeks}w — {Math.abs(weeksLeft)} week{Math.abs(weeksLeft) !== 1 ? 's' : ''} short
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.alertSuccess}>
      <span className={styles.alertIcon}>✅</span>
      <div>
        <div className={styles.alertTitle}>On track!</div>
        <div className={styles.alertSub}>
          {weeksLeft} week{weeksLeft !== 1 ? 's' : ''} ahead of deadline · Finishes in {totalWeeks}w
        </div>
      </div>
    </div>
  )
}
