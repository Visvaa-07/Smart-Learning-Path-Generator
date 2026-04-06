import axios from 'axios'

// Detect correct backend URL
const getBaseURL = () => {
  // In production (not localhost), always use the deployed backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://smart-learning-path-generator.vercel.app/api'
  }
  // In local dev, use Vite proxy
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
