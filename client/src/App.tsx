import {Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login' 
import { SideBar } from './components/SideBar/index'

// Chặn route nếu chưa có token
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute>  
          <SideBar />
        </PrivateRoute>
            } />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
export default App