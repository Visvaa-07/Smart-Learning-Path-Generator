import React, { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pw_token'))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pw_user'))
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/verify')
          setUser(data.user)
        } catch (err) {
          logout()
        }
      }
      setLoading(false)
    }
    verifyUser()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('pw_token', data.token)
    localStorage.setItem('pw_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('pw_token', data.token)
    localStorage.setItem('pw_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('pw_token')
    localStorage.removeItem('pw_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
