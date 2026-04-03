import React from 'react'
import styles from './WeeklyTable.module.css'

export default function WeeklyTable({ modules }) {
  if (!modules || modules.length === 0) return null

  const maxWeek = Math.max(...modules.map(m => m.weekEnd))
  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1)

  const getModulesForWeek = (week) =>
    modules.filter(m => week >= m.weekStart && week <= m.weekEnd)

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.weekCol}>Week</th>
            <th className={styles.modulesCol}>Modules</th>
            <th className={styles.statusCol}>Status</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map(week => {
            const weekMods = getModulesForWeek(week)
            const allDone = weekMods.length > 0 && weekMods.every(m => m.completed)
            const someDone = weekMods.some(m => m.completed)
            return (
              <tr key={week} className={`${styles.row} ${allDone ? styles.rowDone : someDone ? styles.rowPartial : ''}`}>
                <td className={styles.weekCell}>
                  <div className={styles.weekBadge}>W{week}</div>
                </td>
                <td className={styles.modulesCell}>
                  {weekMods.length === 0 ? (
                    <span className={styles.none}>—</span>
                  ) : (
                    <div className={styles.modList}>
                      {weekMods.map(m => (
                        <div key={m._id || m.moduleId || m.name} className={`${styles.modChip} ${m.completed ? styles.modChipDone : ''}`}>
                          <span className={styles.modName}>{m.name}</span>
                          <span className={styles.modHrs}>{m.adjustedHours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className={styles.statusCell}>
                  {weekMods.length === 0 ? (
                    <span className={styles.statusEmpty}>—</span>
                  ) : allDone ? (
                    <span className={styles.statusDone}>✅ Complete</span>
                  ) : someDone ? (
                    <span className={styles.statusPartial}>🔄 In Progress</span>
                  ) : (
                    <span className={styles.statusPending}>⏳ Upcoming</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
