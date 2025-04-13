import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import NotFoundPage from '../modules/Common/Notfound'
import Review from '../modules/Common/Review'
import Calendar from '../modules/Common/Calendar'
import DashboardProductionControll from '../modules/ProductionControl/Dashboard'
import WareHousePC from '../modules/ProductionControl/WareHousePC/WareHousePC'
import Projects from '../modules/ProductionControl/Project/Projects'
import ProgressProject from '../modules/ProductionControl/ProgressProject/ProgressProject'
import Timekeeping from '../modules/ProductionControl/TimeKeeping/Timekeeping'
import Delivery from '../modules/ProductionControl/Delivery/Delivery'
import Login from '../modules/Auth/Login/Login';
import ForgotPassword from '../modules/Auth/ForgotPassword/ForgotPassword';
import CheckOTP from '../modules/Auth/ForgotPassword/CheckOTP';
import ChangePassword from '../modules/Auth/ChangePassword/ChangePassword'
import TimekeepingDetail from '../modules/ProductionControl/TimeKeeping/TimekeepingDetail'
import WareHousePCDetail from '../modules/ProductionControl/WareHousePC/WareHousePCDetail'
import ProjectsDetail from '../modules/ProductionControl/Project/ProjectsDetail'
import ProgressProjectDetail from '../modules/ProductionControl/ProgressProject/ProgressProjectDetail'
import DeliveryDetail from '../modules/ProductionControl/Delivery/DeliveryDetail'
import KanbanBoard from '../modules/ProductionControl/Tasks/KanbanBoard'

function AppRoute() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/check-otp" element={<CheckOTP />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/" element={<MainLayout />}>
            <Route path="/review" element={<Review />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/pm/dashboard" element={<DashboardProductionControll />} />
            <Route path="/pm/so-kho" element={<WareHousePC />} />
            <Route path="/pm/du-an" element={<Projects />} />
            <Route path="/pm/tien-do" element={<ProgressProject />} />
            <Route path="/pm/cham-cong" element={<Timekeeping />} />
            <Route path="/pm/cham-cong-chi-tiet/:id" element={<TimekeepingDetail />} />
            <Route path="/pm/so-kho-chi-tiet/:id" element={<WareHousePCDetail />} />
            <Route path="/pm/du-an-chi-tiet/:id" element={<ProjectsDetail />} />
            <Route path="/pm/tien-do-du-an-chi-tiet/:id" element={<ProgressProjectDetail />} />
            <Route path="/pm/so-giao-nhan-chi-tiet/:id" element={<DeliveryDetail />} />
            <Route path="/pm/so-giao-nhan" element={<Delivery />} />
            <Route path="/pm/cong-viec" element={<KanbanBoard />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}

export default AppRoute