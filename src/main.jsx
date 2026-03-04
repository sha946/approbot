import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './Homepage'
import RobotApp from './RobotApp'
import ProfilePage from './Profilepage'
import DrawApp from './Drawapp'
import { CreateAccountPage, LoginPage } from './AuthPages'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/"         element={<LoginPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<CreateAccountPage />} />
      <Route path="/home"     element={<HomePage />} />
      <Route path="/program"  element={<RobotApp />} />
      <Route path="/profile"  element={<ProfilePage />} />
      <Route path="/draw" element={<DrawApp />} />
    </Routes>
  </BrowserRouter>
)