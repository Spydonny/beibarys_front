import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL, timeout: 15000 })

// Подставляем JWT в каждый запрос.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beibarys_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 -> выкидываем на логин.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('beibarys_token')
      if (!location.pathname.startsWith('/login')) location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const fmtMoney = (n) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(n || 0)) + ' ₸'

export const STATUS_RU = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
  completed: 'Завершена',
}
