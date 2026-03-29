import { Routes, Route } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import Availability from './pages/Availability'
import Meetings from './pages/Meetings'
import BookingPage from './pages/BookingPage'
import ConfirmedPage from './pages/ConfirmedPage'
import ReschedulePage from './pages/ReschedulePage'
import PublicProfile from './pages/PublicProfile'

import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/meetings" element={<Meetings />} />
        </Route>
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="/u/:userId" element={<PublicProfile />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/book/:slug/confirmed" element={<ConfirmedPage />} />
        <Route path="/meetings/:id/reschedule" element={<ReschedulePage />} />
      </Route>
    </Routes>
  )
}

export default App
