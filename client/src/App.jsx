import { Routes, Route } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import Availability from './pages/Availability'
import Meetings from './pages/Meetings'
import BookingPage from './pages/BookingPage'
import ConfirmedPage from './pages/ConfirmedPage'
import ReschedulePage from './pages/ReschedulePage'

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/meetings" element={<Meetings />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/book/:slug/confirmed" element={<ConfirmedPage />} />
        <Route path="/meetings/:id/reschedule" element={<ReschedulePage />} />
      </Route>
    </Routes>
  )
}

export default App
