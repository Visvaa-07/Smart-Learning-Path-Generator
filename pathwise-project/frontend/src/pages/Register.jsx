import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    '🧭 Personalized learning roadmaps',
    '⚙️ Weighted algorithm-based scheduling',
    '📊 Progress tracking & analytics',
    '📚 Real resources per module',
    '🗓 Weekly schedule planner',
  ]

  return (
    <div className={styles.authPage}>
      {/* Left panel */}
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
          Start your journey<br />
          <span className={styles.gradText}>to mastery</span><br />
          today.
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24, position: 'relative', zIndex: 2 }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text2)', fontSize: '0.9rem' }}>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Create account</h2>
          <p className={styles.formSub}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Full name</label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className={styles.field}>
              <label>Confirm password</label>
              <input
                type="password"
                name="confirm"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
