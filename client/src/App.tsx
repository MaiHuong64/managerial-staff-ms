import {Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import { SideBar } from './components/SideBar'
import { TopBar } from './components/TopBar'
import ProfilePage from './pages/ProfilePage'
import type React from 'react'
import { StaffPage } from './pages/VienChuc/StaffListPage'
import { PlanningPage} from './pages/DotQuyHoach/index'
import { PlanningDetailPage } from './pages/DotQuyHoach/PlanningDetail'
import { DashboardPage } from './pages/DashboardPage'
import { AppointmentPage } from './pages/DotBoNhiem'
import AppointmentDetailView from './pages/DotBoNhiem/AppointmentDetailView'
import PersonnelProposalPage from './pages/PhuongAnNhanSu/index'
import PersonnelPlanDetailPage from './pages/PhuongAnNhanSu/DetailPage'
import PhieuChuTruongPage from './pages/PhieuChuTruong'
import PhieuDeXuatNhanSuPage from './pages/PhieuDeXuatNhanSu'
import { NotificationPage } from './pages/NotificationPage'
import { DepartmentPage } from './pages/DepartmentPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import HoSoBoNhiemDetailPage from './pages/PhuongAnNhanSu/HoSoBoNhiemDetailPage'
// Chặn route nếu chưa có token
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const MainLayout: React.FC = () => {
  return(
    <div className='flex min-h-screen bg-gray-50'>
      <SideBar />
      <TopBar />
      <main className='flex-1 ml-58 mt-14 overflow-y-auto'>
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
          <Route path='vien-chuc' element={<StaffPage />}></Route>
          <Route path='dot-quy-hoach' element={<PlanningPage />}></Route>
          <Route path='dot-quy-hoach/:id' element={<PlanningDetailPage />}></Route>
          <Route path='dot-bo-nhiem' element={<AppointmentPage />}></Route>
          <Route path="dot-bo-nhiem/:id" element={<AppointmentDetailView />} />
          <Route path='/phuong-an-nhan-su' element={<PersonnelProposalPage/>}></Route>
          <Route path='/phuong-an-nhan-su/:id' element={<PersonnelPlanDetailPage />}></Route>
          <Route path='/phieu-chu-truong' element={<PhieuChuTruongPage/>}></Route>
           <Route path='/phieu-de-xuat' element={<PhieuDeXuatNhanSuPage/>}></Route>
          <Route path='notification' element={<NotificationPage />} />
          <Route path='don-vi' element={<DepartmentPage />} />
          <Route path='approveAppointment' element={<ComingSoonPage title="Duyệt bổ nhiệm" />} />
          <Route path='chuc-danh' element={<ComingSoonPage title="Quản lý chức danh" />} />
          <Route path="/ho-so-bo-nhiem/:id" element={<HoSoBoNhiemDetailPage />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>       
      </Routes>
  )
}

export default App