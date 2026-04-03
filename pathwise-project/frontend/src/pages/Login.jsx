import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      {/* Left decorative panel */}
      <div className={styles.leftPanel}>
        <div className={styles.gridOverlay} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />

        <div className={styles.brandBlock}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>🧭</div>
            <span className={styles.brandName}>Path<span>Wise</span></span>
          </div>
          <p className={styles.brandTagline}>Smart Learning Path Generator</p>
        </div>

        <h1 className={styles.heroHeadline}>
          Your personalized<br />
          <span className={styles.gradText}>roadmap to mastery</span><br />
          starts here.
        </h1>
        <p className={styles.heroSub}>
          Enter your skill level, available hours, and subject — we'll generate a precise, weighted study plan tailored just for you.
        </p>

        <div className={styles.statsRow}>
          {[
            { num: '6+', label: 'Subjects' },
            { num: '45+', label: 'Modules' },
            { num: '3', label: 'Skill Levels' },
          ].map(s => (
            <div key={s.label} className={styles.stat}>
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Floating cards */}
        <div className={`${styles.floatCard} ${styles.fc1}`}>
          <div className={styles.fcTag}>📘 Data Science · Week 1</div>
          <div className={styles.fcTitle}>Python Fundamentals</div>
          <div className={styles.fcMeta}>15 hrs · Beginner</div>
          <div className={styles.fcBar}><div className={styles.fcFill} style={{ width: '65%' }} /></div>
        </div>
        <div className={`${styles.floatCard} ${styles.fc2}`}>
          <div className={styles.fcTag}>⚙️ Algorithm adjusted</div>
          <div className={styles.fcTitle}>Skill multiplier: 1.5×</div>
          <div className={styles.fcMeta}>8 hrs/week · 3 weeks</div>
        </div>
        <div className={`${styles.floatCard} ${styles.fc3}`}>
          <div className={styles.fcTag}>✅ Progress Saved</div>
          <div className={styles.fcTitle}>3 of 8 modules complete</div>
          <div className={styles.fcBar}><div className={styles.fcFill} style={{ width: '37%', background: 'linear-gradient(90deg, #34d399, #059669)' }} /></div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Welcome back</h2>
          <p className={styles.formSub}>
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In →'}
            </button>
          </form>

          <div className={styles.divider}><span>or continue with demo</span></div>
          <button className={styles.demoBtn} onClick={() => {
            setForm({ email: 'demo@pathwise.com', password: 'demo123' })
          }}>
            🎓 Use Demo Account
          </button>
        </div>
      </div>
    </div>
  )
}
