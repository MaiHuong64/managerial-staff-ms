import {Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import Login from './pages/Login' 
import { SideBar } from './components/SideBar'
import ProfilePage from './pages/ProfilePage'
import type React from 'react'
import { StaffPage } from './pages/StaffListPage'
import { PlanningPage} from './pages/Planning/index'
import { PlanningDetailPage } from './pages/Planning/PlanningDetail'
import { DashboardPage } from './pages/DashboardPage'
import { NotificationPage } from './pages/NotificationPage'
import { DepartmentPage } from './pages/DepartmentPage'
import { AppointmentPage } from './pages/appointment'
import AppointmentDetailView from './pages/appointment/AppointmentDetailView'
import PlanningProposalPage from './pages/Proposal'
// const Dashboard = () => <div className="p-10 text-2xl">Chào mừng bạn đến với Dashboard AGU!</div>

// Chặn route nếu chưa có token
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const MainLayout: React.FC = () => {
  return(
    <div className='flex min-h-screen bg-gray-50'>
      <SideBar />
      <main className='flex-1 ml-58 overflow-hidden'>
        <Outlet />
      </main>
  </div>
  )
}

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='/' element= {
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>

          {/*All Pages to render */}
          <Route path='dashboard' element={<DashboardPage/>}></Route>
          <Route path='profile' element={<ProfilePage />}></Route>
          <Route path='staffs' element={<StaffPage />}></Route>
          <Route path='plannings' element={<PlanningPage />}></Route>
          <Route path='plannings/:id' element={<PlanningDetailPage />}></Route>
          <Route path='appointments' element={<AppointmentPage />}></Route>
          <Route path="appointments/:id" element={<AppointmentDetailView />} />
          <Route path='/personnelPlan' element={<PlanningProposalPage />}></Route>
          <Route path='' element={<NotificationPage/>}></Route>
          <Route path='' element={<DepartmentPage />}></Route>
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>       
      </Routes>
  )
}

export default App