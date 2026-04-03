import React, { useState } from 'react'
import styles from './ModuleCard.module.css'

const PLATFORM_META = {
  YouTube: { icon: '▶️', color: '#ff4444', label: 'YouTube' },
  Coursera: { icon: '🎓', color: '#0056d3', label: 'Coursera' },
}

export default function ModuleCard({ module, index, onToggleComplete }) {
  const [expanded, setExpanded] = useState(false)

  const platform = PLATFORM_META[module.resource?.platform] || { icon: '🔗', color: '#4f8ef7', label: 'Resource' }

  const systemCompletion = typeof module.completion === 'number' ? module.completion : 100
  let sysStatusText = '⏳ Pending'
  let statusClass = styles.statusPending
  
  if (module.completed) {
    sysStatusText = '✅ Done'
    statusClass = styles.statusDone
  } else if (systemCompletion < 100 && systemCompletion >= 70) {
    sysStatusText = 'In Progress'
    statusClass = styles.statusWarning
  } else if (systemCompletion < 70) {
    sysStatusText = 'At Risk'
    statusClass = styles.statusRisk
  }

  return (
    <div className={`${styles.card} ${module.completed ? styles.cardDone : ''}`}>
      {/* Left accent bar */}
      <div className={styles.accentBar} style={{ background: module.completed ? 'var(--success)' : 'var(--accent)' }} />

      <div className={styles.cardBody}>
        {/* Header row */}
        <div className={styles.headerRow}>
          <div className={styles.indexBadge}>
            {module.completed ? '✓' : index + 1}
          </div>
          <div className={styles.titleBlock}>
            <h3 className={styles.moduleTitle}>{module.name}</h3>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>⏱ {module.allocatedHours ?? module.adjustedHours} hrs</span>
              <span className={styles.metaChip}>
                📅 Week {module.weekStart === module.weekEnd ? module.weekStart : `${module.weekStart}–${module.weekEnd}`}
              </span>
              <span className={styles.metaChip}>⚖️ ×{module.complexityWeight?.toFixed(1)}</span>
            </div>
          </div>
          <div className={styles.rightCol}>
            <span className={`${styles.statusBadge} ${statusClass}`}>
              {sysStatusText}
            </span>
            <button
              className={styles.expandBtn}
              onClick={() => setExpanded(e => !e)}
              aria-label="Toggle details"
            >
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: module.completed ? '100%' : '0%' }}
          />
        </div>

        {/* Expanded section */}
        {expanded && (
          <div className={styles.expanded}>
            <div className={styles.divider} />

            {/* Resource */}
            {module.resource && (
              <div className={styles.resourceBlock}>
                <span className={styles.resourceHeading}>📚 Study Resource</span>
                <a
                  href={module.resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                  style={{ '--platform-color': platform.color }}
                >
                  <span className={styles.platformIcon}>{platform.icon}</span>
                  <div className={styles.resourceInfo}>
                    <span className={styles.resourceTitle}>{module.resource.title}</span>
                    <span className={styles.resourcePlatform}>
                      {platform.label}
                      {module.resource.duration_mins && ` · ${module.resource.duration_mins} min`}
                    </span>
                  </div>
                  <span className={styles.externalArrow}>↗</span>
                </a>
              </div>
            )}

            {/* Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{module.adjustedHours}</span>
                <span className={styles.statLabel}>Adjusted Hours</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{module.weekEnd - module.weekStart + 1}</span>
                <span className={styles.statLabel}>Weeks Allocated</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>×{module.complexityWeight?.toFixed(1)}</span>
                <span className={styles.statLabel}>Complexity Weight</span>
              </div>
            </div>

            {/* Complete toggle */}
            <button
              className={`${styles.completeBtn} ${module.completed ? styles.completeBtnDone : ''}`}
              onClick={() => onToggleComplete(module._id || module.moduleId, !module.completed)}
            >
              {module.completed ? '↩ Mark as Incomplete' : '✓ Mark as Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
