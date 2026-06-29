import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Bookings from './pages/Bookings'
import Stats from './pages/Stats'
import Chats from './pages/Chats'
import Settings from './pages/Settings'

function Protected({ children }) {
  const { isAuthed } = useAuth()
  return isAuthed ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/bookings" replace />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="stats" element={<Stats />} />
        <Route path="chats" element={<Chats />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
