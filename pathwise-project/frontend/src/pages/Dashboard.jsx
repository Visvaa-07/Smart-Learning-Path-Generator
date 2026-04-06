import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import Navbar from '../components/Navbar'
import ModuleCard from '../components/ModuleCard'
import WeeklyTable from '../components/WeeklyTable'
import ProgressBar from '../components/ProgressBar'
import DeadlineAlert from '../components/DeadlineAlert'
import api from '../api/axios'
import styles from './Dashboard.module.css'

const TABS = ['Overview', 'Modules', 'Schedule', 'Analytics']

export default function Dashboard() {
  const [paths, setPaths] = useState([])
  const [activePathId, setActivePathId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [updatingId, setUpdatingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const fetchPaths = async () => {
    try {
      const { data } = await api.get('/path/me')
      const pathsData = Array.isArray(data) ? data : (data ? [data] : [])
      setPaths(pathsData)
      if (pathsData.length > 0 && !activePathId) {
        setActivePathId(pathsData[0]._id)
      }
    } catch (err) {
      console.error('Failed to fetch paths', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaths()
  }, [])

  const path = paths.find(p => p._id === activePathId) || paths[0] || null

  const handleToggleComplete = async (moduleId, completed) => {
    // [FIX] Always use the ID of the displayed path
    const currentPathId = path?._id
    if (!currentPathId) return
    setUpdatingId(moduleId)
    try {
      await api.put(`/progress/${currentPathId}/${moduleId}`, { completed })
      setPaths(prev => prev.map(p => {
        if (p._id !== currentPathId) return p
        return {
          ...p,
          modules: p.modules.map(m =>
            (m._id === moduleId || m.moduleId === moduleId)
              ? { ...m, completed, completedAt: completed ? new Date().toISOString() : null }
              : m
          )
        }
      }))
    } catch (e) {
      console.error('Progress update failed', e)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeletePath = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const currentPathId = path?._id
    if (!currentPathId) return
    setShowDeleteModal(false)
    try {
      setLoading(true)
      console.log('[FRONTEND] Deleting path:', currentPathId);
      await api.delete(`/path/${currentPathId}`)
      
      const newPaths = paths.filter(p => p._id !== currentPathId)
      setPaths(newPaths)
      if (newPaths.length > 0) {
        setActivePathId(newPaths[0]._id)
      } else {
        setActivePathId(null)
      }
    } catch (err) {
      console.error('[FRONTEND] Delete failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustPath = async (extraHours = 0, extraWeeks = 0) => {
    if (!path) return
    try {
      setLoading(true)
      const res = await api.post('/path/generate', {
        subject: path.subject,
        skillLevel: path.skillLevel,
        hoursPerWeek: path.hoursPerWeek + extraHours,
        deadlineWeeks: (path.deadlineWeeks || path.totalWeeks) + extraWeeks
      })
      // Update paths list
      setPaths(prev => prev.map(p => p._id === activePathId ? res.data : p))
    } catch (err) {
      console.error('Adjust failed', err)
    } finally {
      setLoading(false)
    }
  }

  // Multi-Path Safe Calculation
  const completedCount = path?.modules?.filter(m => m.completed).length || 0
  const totalModules = path?.modules?.length || 0
  const totalHours = path?.modules?.reduce((sum, m) => sum + (m.allocatedHours ?? m.adjustedHours), 0) || 0
  const completedHours = path?.modules?.filter(m => m.completed).reduce((sum, m) => sum + (m.allocatedHours ?? m.adjustedHours), 0) || 0

  const totalRequiredHours = path?.totalRequiredHours || totalHours
  const totalAvailableHours = path?.totalAvailableHours || (path?.deadlineWeeks ? path.deadlineWeeks * path.hoursPerWeek : totalHours)
  const isOverloaded = path?.isOverloaded || false
  const deficit = isOverloaded ? totalRequiredHours - totalAvailableHours : 0
  
  const completionPercent = totalRequiredHours > 0 ? ((totalAvailableHours / totalRequiredHours) * 100).toFixed(0) : 100
  const workloadPercent = totalAvailableHours > 0 ? ((totalRequiredHours / totalAvailableHours) * 100).toFixed(0) : 100
  const requiredWeekly = path?.deadlineWeeks ? Math.ceil(totalRequiredHours / path.deadlineWeeks) : 0
  const requiredWeeks = path?.hoursPerWeek ? Math.ceil(totalRequiredHours / path.hoursPerWeek) : 0

  const chartData = path?.modules?.map(m => ({
    name: m.name.length > 14 ? m.name.slice(0, 14) + '…' : m.name,
    hours: m.adjustedHours,
    completed: m.completed,
  })) || []

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingInner}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p>Syncing your goals…</p>
      </div>
    </div>
  )

  if (paths.length === 0) return (
    <div className={styles.emptyPage}>
      <Navbar onNewPath={() => navigate('/onboarding')} />
      <div className={styles.emptyInner}>
        <div className={styles.emptyIcon}>🗺️</div>
        <h2>No learning path yet</h2>
        <p>Generate your personalized path to get started.</p>
        <button className={styles.ctaBtn} onClick={() => navigate('/onboarding')}>
          🚀 Generate My Path
        </button>
      </div>
    </div>
  )

  if (!path) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingInner}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p>Selecting your goal…</p>
      </div>
    </div>
  )

  const skillMultipliers = { beginner: 1.5, intermediate: 1.0, advanced: 0.6 }
  const multiplier = skillMultipliers[path?.skillLevel] || 1.0

  // Calculate current week of the path (Path is guaranteed to exist here)
  const startDate = new Date(path?.generatedAt || Date.now())
  const today = new Date()
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
  const currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1)

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid} />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#141929', border: '1px solid #1e2740',
            borderRadius: 16, padding: '2rem', maxWidth: 400, width: '90%',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ color: '#e8eaf2', margin: '0 0 8px', fontSize: '1.2rem' }}>Delete Learning Path?</h3>
            <p style={{ color: '#5a6380', margin: '0 0 24px', fontSize: '0.9rem' }}>
              <strong style={{ color: '#f59e0b' }}>{path?.subject}</strong> and all its progress will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: '1px solid #1e2740',
                  background: 'transparent', color: '#e8eaf2', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar onNewPath={() => navigate('/onboarding')} />

      <main className={styles.main}>

        {/* Hero summary bar */}
        <div className={styles.heroBar}>
          <div className={styles.heroLeft}>
            <div className={styles.subjectHeader}>
              <div className={styles.subjectPill}>
                <span>{path.subject}</span>
              </div>
              <button onClick={handleDeletePath} className={styles.deleteBtn} title="Delete this path">
                🗑️
              </button>
            </div>
            <h1 className={styles.pathTitle}>
              {path.subject} RoadMap
            </h1>
            
            {/* GOAL SWITCHER */}
            <div className={styles.pathSwitcher}>
              <span className={styles.switcherLabel}>My Goals:</span>
              <div className={styles.switcherList}>
                {paths.map(p => (
                  <button 
                    key={p._id} 
                    className={`${styles.switcherTab} ${p._id === activePathId ? styles.switcherTabActive : ''}`}
                    onClick={() => setActivePathId(p._id)}
                  >
                    {p.subject}
                  </button>
                ))}
                <button className={styles.addPathBtn} onClick={() => navigate('/onboarding')}>
                  + New Goal
                </button>
              </div>
            </div>
          </div>
          <div className={styles.heroStats}>
            {[
              { label: 'Current Week', val: `Week ${currentWeek}`, icon: '📍' },
              { label: 'Total Weeks', val: path.totalWeeks, icon: '🗓' },
              { label: 'Total Hours', val: totalHours, icon: '⏱' },
              { label: 'Completed', val: completedCount, icon: '✅' },
            ].map(s => (
              <div key={s.label} className={styles.heroStat}>
                <span className={styles.heroStatIcon}>{s.icon}</span>
                <span className={styles.heroStatVal}>{s.val}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feasibility Summary Section */}
        <div className={styles.feasibilityContainer}>
          <div className={styles.feasibilityStatsCard}>
            <div className={styles.fsItem}>Total Work: <strong>{totalRequiredHours} hrs</strong></div>
            <div className={styles.fsItem}>Available Time: <strong>{totalAvailableHours} hrs</strong></div>
            <div className={styles.fsItem}>Feasible Scope: <strong>~{completionPercent}%</strong></div>
            <div className={styles.fsItem}>Est. Workload: <strong>{workloadPercent}%</strong></div>
          </div>

          {isOverloaded && (
            <div className={styles.advisoryAlert}>
              <div className={styles.advisoryWarning}>
                <strong>⚠️ You are short by {deficit} hrs</strong>
                <p>Timeline only naturally fits ~{completionPercent}% of the curriculum</p>
                <p>You're operating at an {workloadPercent}% workload capacity</p>
              </div>
              <div className={styles.advisorySuggestions}>
                <strong>Recommended Decisions:</strong>
                <div className={styles.suggestionActions}>
                  <button onClick={() => handleAdjustPath(Math.ceil(deficit/path.deadlineWeeks))} className={styles.suggestBtn}>
                    ⚡️ Add {Math.ceil(deficit/path.deadlineWeeks)}h/week to fit everything
                  </button>
                  <button onClick={() => handleAdjustPath(0, Math.ceil(deficit/path.hoursPerWeek))} className={styles.suggestBtn}>
                    🗓 Extend by {Math.ceil(deficit/path.hoursPerWeek)} weeks
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress + Deadline */}
        <div className={styles.topRow}>
          <div className={styles.progressCard}>
            <ProgressBar completed={completedCount} total={totalModules} />
            <div className={styles.hoursRow}>
              <div className={styles.hoursItem}>
                <span className={styles.hoursVal}>{completedHours}</span>
                <span className={styles.hoursLabel}>hrs done</span>
              </div>
              <div className={styles.hoursDivider} />
              <div className={styles.hoursItem}>
                <span className={styles.hoursVal}>{totalHours - completedHours}</span>
                <span className={styles.hoursLabel}>hrs left</span>
              </div>
              <div className={styles.hoursDivider} />
              <div className={styles.hoursItem}>
                <span className={styles.hoursVal}>{totalHours}</span>
                <span className={styles.hoursLabel}>total hrs</span>
              </div>
            </div>
          </div>
          <div className={styles.deadlineCard}>
            <DeadlineAlert
              totalWeeks={path.totalWeeks}
              deadlineWeeks={path.deadlineWeeks}
              isOverloaded={path.isOverloaded}
            />
            <div className={styles.algoSummary}>
              <span className={styles.algoTitle}>⚙️ Algorithm Summary</span>
              <div className={styles.algoGrid}>
                <div><span className={styles.algoKey}>Skill multiplier</span><span className={styles.algoVal}>×{multiplier}</span></div>
                <div><span className={styles.algoKey}>Hrs / week</span><span className={styles.algoVal}>{path.hoursPerWeek}</span></div>
                <div><span className={styles.algoKey}>Buffer</span><span className={styles.algoVal}>+10%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>

          {/* ── Overview ── */}
          {activeTab === 'Overview' && (
            <div className={`${styles.overviewGrid} fade-in`}>
              <div className={styles.overviewModules}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>All Modules</h2>
                  <span className={styles.sectionCount}>{totalModules} total</span>
                </div>
                <div className={styles.moduleList}>
                  {path.modules.map((mod, i) => (
                    <ModuleCard
                      key={mod._id || mod.moduleId || i}
                      module={mod}
                      index={i}
                      currentWeek={currentWeek}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.overviewSidebar}>
                <div className={styles.sideCard}>
                  <h3 className={styles.sideTitle}>📊 Hours per Module</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9, fill: '#5a6380' }}
                        angle={-40}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#5a6380' }} />
                      <Tooltip
                        contentStyle={{ background: '#141929', border: '1px solid #1e2740', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: '#e8eaf2' }}
                      />
                      <Bar dataKey="hours" radius={[4,4,0,0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.completed ? '#34d399' : '#4f8ef7'} fillOpacity={entry.completed ? 0.8 : 0.7} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.sideCard}>
                  <h3 className={styles.sideTitle}>📋 Path Details</h3>
                  <div className={styles.detailsList}>
                    {[
                      ['Subject', path.subject],
                      ['Skill Level', path.skillLevel],
                      ['Hours / Week', `${path.hoursPerWeek} hrs`],
                      ['Total Weeks', `${path.totalWeeks} weeks`],
                      ['Total Hours', `${totalHours} hrs`],
                      ['Skill Multiplier', `×${multiplier}`],
                      ['Generated', new Date(path.generatedAt || Date.now()).toLocaleDateString()],
                    ].map(([k, v]) => (
                      <div key={k} className={styles.detailRow}>
                        <span className={styles.detailKey}>{k}</span>
                        <span className={styles.detailVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Modules ── */}
          {activeTab === 'Modules' && (
            <div className="fade-in">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Modules</h2>
                <div className={styles.filterRow}>
                  <span className={styles.sectionCount}>{completedCount}/{totalModules} done</span>
                </div>
              </div>
              <div className={styles.moduleListFull}>
                {path.modules.map((mod, i) => (
                  <ModuleCard
                    key={mod._id || mod.moduleId || i}
                    module={mod}
                    index={i}
                    currentWeek={currentWeek}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Schedule ── */}
          {activeTab === 'Schedule' && (
            <div className="fade-in">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Weekly Schedule</h2>
                <span className={styles.sectionCount}>{path.totalWeeks} weeks total</span>
              </div>
              <WeeklyTable modules={path.modules} />
            </div>
          )}

          {/* ── Analytics ── */}
          {activeTab === 'Analytics' && (
            <div className={`${styles.analyticsGrid} fade-in`}>
              <div className={styles.analyticsCard}>
                <h3 className={styles.sideTitle}>⏱ Hours Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 50, left: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#5a6380' }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#5a6380' }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#5a6380', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#141929', border: '1px solid #1e2740', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="hours" radius={[5,5,0,0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.completed ? '#34d399' : '#4f8ef7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className={styles.legendRow}>
                  <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#34d399' }} /> Completed</span>
                  <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#4f8ef7' }} /> Pending</span>
                </div>
              </div>

              <div className={styles.analyticsRight}>
                <div className={styles.analyticsCard}>
                  <h3 className={styles.sideTitle}>📈 Completion Stats</h3>
                  <div className={styles.bigStatGrid}>
                    {[
                      { val: `${completedCount}/${totalModules}`, label: 'Modules Done', color: 'var(--success)' },
                      { val: `${completedHours}h`, label: 'Hours Completed', color: 'var(--accent)' },
                      { val: `${totalHours - completedHours}h`, label: 'Hours Remaining', color: 'var(--accent2)' },
                      { val: `${path.totalWeeks}w`, label: 'Total Duration', color: 'var(--gold)' },
                    ].map(s => (
                      <div key={s.label} className={styles.bigStat}>
                        <span className={styles.bigStatVal} style={{ color: s.color }}>{s.val}</span>
                        <span className={styles.bigStatLabel}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <h3 className={styles.sideTitle}>⚙️ Algorithm Breakdown</h3>
                  <div className={styles.algoBreakdown}>
                    <div className={styles.formulaBox}>
                      <code>adjustedHours = baseHours × {multiplier} × complexityWeight</code>
                    </div>
                    <div className={styles.detailsList}>
                      {path.modules.map((m, i) => (
                        <div key={i} className={styles.detailRow}>
                          <span className={styles.detailKey}>{m.name}</span>
                          <span className={styles.detailVal}>{m.adjustedHours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
