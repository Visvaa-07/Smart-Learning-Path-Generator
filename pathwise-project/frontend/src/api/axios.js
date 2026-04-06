import axios from 'axios'

// Detect correct backend URL
const getBaseURL = () => {
  // Use environment variable if available (e.g. on Vercel)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  // In local dev without env var, use Vite proxy
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pw_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pw_token')
      localStorage.removeItem('pw_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
