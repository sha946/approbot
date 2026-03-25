import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './HomePage'
import RobotApp from './RobotApp'

import DrawApp from './Drawapp'

import KidsRobotApp from "./Kidsrobotapp";
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/"         element={<HomePage/>} />
  
     
      <Route path="/home"     element={<HomePage />} />
      <Route path="/program"  element={<RobotApp />} />
   
      <Route path="/draw" element={<DrawApp />}/>
      <Route path="/kids" element={<KidsRobotApp />} />
    </Routes>
  </BrowserRouter>
)