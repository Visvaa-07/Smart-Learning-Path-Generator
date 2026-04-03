import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import styles from './Onboarding.module.css'

const STEPS = ['Subject', 'Skill Level', 'Schedule', 'Review']

const SKILL_OPTIONS = [
  {
    value: 'beginner',
    label: 'Beginner',
    icon: '🌱',
    desc: 'Little to no prior knowledge',
    multiplier: '1.5× hours',
    color: '#34d399',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    icon: '🔥',
    desc: 'Some foundational understanding',
    multiplier: '1.0× hours',
    color: '#f5c842',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    icon: '⚡',
    desc: 'Strong background, need refinement',
    multiplier: '0.6× hours',
    color: '#4f8ef7',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({
    subject: '',
    skillLevel: '',
    hoursPerWeek: '',
    deadlineWeeks: '',
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/subjects').then(({ data }) => setSubjects(data)).catch(() => {
      // Fallback subjects if API not running
      setSubjects([
        { _id: '1', name: 'Data Science', icon: '📊', modules: 8 },
        { _id: '2', name: 'Web Development', icon: '🌐', modules: 8 },
        { _id: '3', name: 'Mathematics', icon: '📐', modules: 7 },
        { _id: '4', name: 'Machine Learning', icon: '🤖', modules: 8 },
        { _id: '5', name: 'Cybersecurity', icon: '🔐', modules: 7 },
        { _id: '6', name: 'Mobile Development', icon: '📱', modules: 7 },
      ])
    })
  }, [])

  const skillInfo = SKILL_OPTIONS.find(s => s.value === form.skillLevel)

  const estimateWeeks = () => {
    if (!form.skillLevel || !form.hoursPerWeek) return null
    const avgBase = 12
    const multipliers = { beginner: 1.5, intermediate: 1.0, advanced: 0.6 }
    const modules = subjects.find(s => s.name === form.subject)?.modules || 8
    const adj = avgBase * multipliers[form.skillLevel]
    return Math.ceil((adj * modules) / Number(form.hoursPerWeek))
  }

  const estWeeks = estimateWeeks()
  const deadlineOk = !form.deadlineWeeks || estWeeks === null || estWeeks <= Number(form.deadlineWeeks)

  const canNext = () => {
    if (step === 0) return !!form.subject
    if (step === 1) return !!form.skillLevel
    if (step === 2) return form.hoursPerWeek >= 1 && form.hoursPerWeek <= 80
    return true
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const { data } = await api.post('/path/generate', {
        subject: form.subject,
        skillLevel: form.skillLevel,
        hoursPerWeek: Number(form.hoursPerWeek),
        deadlineWeeks: form.deadlineWeeks ? Number(form.deadlineWeeks) : null,
      })
      navigate('/dashboard', { state: { path: data } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate path. Please try again.')
      setGenerating(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid} />
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>🧭</div>
          <span className={styles.logoName}>Path<span>Wise</span></span>
        </div>
        <div className={styles.userChip}>
          <span>👋</span>
          <span>{user?.name || 'Student'}</span>
        </div>
      </header>

      <main className={styles.main}>
        {/* Step indicator */}
        <div className={styles.stepBar}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`${styles.stepItem} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepCircle}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={styles.stepLabel}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className={styles.card}>

          {/* Step 0 — Subject */}
          {step === 0 && (
            <div className={`${styles.stepContent} fade-in`}>
              <h2 className={styles.stepTitle}>What do you want to learn?</h2>
              <p className={styles.stepDesc}>Choose a subject and we'll build your personalized roadmap.</p>
              <div className={styles.subjectGrid}>
                {subjects.map(s => (
                  <button
                    key={s._id || s.name}
                    className={`${styles.subjectCard} ${form.subject === s.name ? styles.subjectSelected : ''}`}
                    onClick={() => setForm({ ...form, subject: s.name })}
                  >
                    <span className={styles.subjectIcon}>{s.icon}</span>
                    <span className={styles.subjectName}>{s.name}</span>
                    <span className={styles.subjectMeta}>{s.modules} modules</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Skill Level */}
          {step === 1 && (
            <div className={`${styles.stepContent} fade-in`}>
              <h2 className={styles.stepTitle}>What's your current level?</h2>
              <p className={styles.stepDesc}>This adjusts how many hours each module is allocated to you.</p>
              <div className={styles.skillGrid}>
                {SKILL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.skillCard} ${form.skillLevel === opt.value ? styles.skillSelected : ''}`}
                    onClick={() => setForm({ ...form, skillLevel: opt.value })}
                    style={{ '--skill-color': opt.color }}
                  >
                    <span className={styles.skillIcon}>{opt.icon}</span>
                    <span className={styles.skillLabel}>{opt.label}</span>
                    <span className={styles.skillDesc}>{opt.desc}</span>
                    <div className={styles.skillBadge}>{opt.multiplier}</div>
                  </button>
                ))}
              </div>

              {skillInfo && (
                <div className={styles.algoBox}>
                  <span className={styles.algoLabel}>⚙️ Algorithm note</span>
                  <span>As a <strong>{skillInfo.label}</strong>, each module's base hours will be multiplied by <strong>{skillInfo.multiplier}</strong> to calculate your adjusted study time.</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Schedule */}
          {step === 2 && (
            <div className={`${styles.stepContent} fade-in`}>
              <h2 className={styles.stepTitle}>Set your schedule</h2>
              <p className={styles.stepDesc}>We'll distribute modules across weeks based on your availability.</p>

              <div className={styles.scheduleFields}>
                <div className={styles.scheduleField}>
                  <label>Hours available per week</label>
                  <div className={styles.inputWrap}>
                    <input
                      type="number"
                      min="1" max="80"
                      placeholder="e.g. 10"
                      value={form.hoursPerWeek}
                      onChange={e => setForm({ ...form, hoursPerWeek: e.target.value })}
                    />
                    <span className={styles.inputSuffix}>hrs / week</span>
                  </div>
                  <p className={styles.fieldHint}>Realistic estimate — includes study, practice & review time.</p>
                </div>

                <div className={styles.scheduleField}>
                  <label>Target completion deadline <span className={styles.optional}>(optional)</span></label>
                  <div className={styles.inputWrap}>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 16"
                      value={form.deadlineWeeks}
                      onChange={e => setForm({ ...form, deadlineWeeks: e.target.value })}
                    />
                    <span className={styles.inputSuffix}>weeks</span>
                  </div>
                  <p className={styles.fieldHint}>Leave blank to let the algorithm determine the ideal timeline.</p>
                </div>
              </div>

              {/* Live estimate */}
              {estWeeks && (
                <div className={`${styles.estimateBox} ${!deadlineOk ? styles.estimateWarn : ''}`}>
                  <div className={styles.estimateRow}>
                    <span className={styles.estimateIcon}>{deadlineOk ? '📅' : '⚠️'}</span>
                    <div>
                      <div className={styles.estimateTitle}>
                        {deadlineOk
                          ? `Estimated completion: ~${estWeeks} weeks`
                          : `Deadline conflict: need ~${estWeeks} weeks, you set ${form.deadlineWeeks}`}
                      </div>
                      <div className={styles.estimateSub}>
                        {deadlineOk
                          ? `Based on ${form.hoursPerWeek} hrs/week as a ${form.skillLevel}`
                          : 'Consider increasing hours/week or extending your deadline'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className={`${styles.stepContent} fade-in`}>
              <h2 className={styles.stepTitle}>Review & Generate</h2>
              <p className={styles.stepDesc}>Confirm your inputs and we'll generate your personalised learning path.</p>

              <div className={styles.reviewGrid}>
                {[
                  { label: 'Subject', value: form.subject, icon: '📚' },
                  { label: 'Skill Level', value: form.skillLevel.charAt(0).toUpperCase() + form.skillLevel.slice(1), icon: '🎯' },
                  { label: 'Hours / Week', value: `${form.hoursPerWeek} hrs`, icon: '⏱' },
                  { label: 'Deadline', value: form.deadlineWeeks ? `${form.deadlineWeeks} weeks` : 'Not set', icon: '📅' },
                  { label: 'Est. Completion', value: estWeeks ? `~${estWeeks} weeks` : '—', icon: '🗓' },
                  { label: 'Skill Multiplier', value: skillInfo?.multiplier, icon: '⚙️' },
                ].map(r => (
                  <div key={r.label} className={styles.reviewItem}>
                    <span className={styles.reviewIcon}>{r.icon}</span>
                    <div>
                      <div className={styles.reviewLabel}>{r.label}</div>
                      <div className={styles.reviewValue}>{r.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {!deadlineOk && (
                <div className={styles.warnBox}>
                  ⚠️ Your deadline may be tight. The algorithm will still generate your path but mark it as overloaded.
                </div>
              )}

              {error && <div className={styles.errorBox}>⚠️ {error}</div>}

              <button className={styles.generateBtn} onClick={handleGenerate} disabled={generating}>
                {generating
                  ? <><span className="spinner" /> Generating your path...</>
                  : '🚀 Generate My Learning Path'}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.navRow}>
            {step > 0 && (
              <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            {step < 3 && (
              <button
                className={styles.nextBtn}
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
