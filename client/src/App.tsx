import {Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login' 
import { SideBar } from './components/SideBar'
// const Dashboard = () => <div className="p-10 text-2xl">Chào mừng bạn đến với Dashboard AGU!</div>

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

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
  )
}

export default App