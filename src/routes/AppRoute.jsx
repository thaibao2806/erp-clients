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
import Repair from '../modules/ProductionControl/Propose/Repair/Repair'
import RepairDetail from '../modules/ProductionControl/Propose/Repair/RepairDetail'
import Liquidation from '../modules/ProductionControl/Propose/Liquidation/Liquidation'
import LiquidationDetail from '../modules/ProductionControl/Propose/Liquidation/LiquidationDetail'
import BuySupplies from '../modules/ProductionControl/Propose/BuySupplies/BuySupplies'
import BuySuppliesDetail from '../modules/ProductionControl/Propose/BuySupplies/BuySuppliesDetail'
import RepairSupplies from '../modules/ProductionControl/Propose/RepairSupplies/RepairSupplies'
import RepairSuppliesDetail from '../modules/ProductionControl/Propose/RepairSupplies/RepairSuppliesDetail'
import EquipmentSupply from '../modules/ProductionControl/Propose/EquipmentSupply/EquipmentSupply'
import EquipmentSupplyDetail from '../modules/ProductionControl/Propose/EquipmentSupply/EquipmentSupplyDetail'
import EquipmentHandover from '../modules/ProductionControl/Protocol/EquipmentHandover/EquipmentHandover'
import EquipmentHandoverDetail from '../modules/ProductionControl/Protocol/EquipmentHandover/EquipmentHandoverDetail'
import RecoveryMaterials from '../modules/ProductionControl/Protocol/RecoveryMaterials/RecoveryMaterials'
import RecoveryMaterialsDetail from '../modules/ProductionControl/Protocol/RecoveryMaterials/RecoveryMaterialsDetail'
import CheckRepairs from '../modules/ProductionControl/Protocol/CheckRepairs/CheckRepairs'
import CheckRepairsDetail from '../modules/ProductionControl/Protocol/CheckRepairs/CheckRepairsDetail'
import ConfirmStatus from '../modules/ProductionControl/Protocol/ConfirmStatus/ConfirmStatus'
import ConfirmStatusDetail from '../modules/ProductionControl/Protocol/ConfirmStatus/ConfirmStatusDetail'

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
            <Route path="/pm/de-xuat/de-xuat-sua-chua" element={<Repair />} />
            <Route path="/pm/de-xuat/sua-chua-chi-tiet/:id" element={<RepairDetail />} />
            <Route path="/pm/de-xuat/de-xuat-thanh-ly" element={<Liquidation />} />
            <Route path="/pm/de-xuat/thanh-ly-chi-tiet/:id" element={<LiquidationDetail />} />
            <Route path="/pm/de-xuat/de-xuat-mua-vat-tu-ccdc" element={<BuySupplies />} />
            <Route path="/pm/de-xuat/mua-vat-tu-ccdc-chi-tiet/:id" element={<BuySuppliesDetail />} />
            <Route path="/pm/de-xuat/de-xuat-vat-tu-sua-chua" element={<RepairSupplies />} />
            <Route path="/pm/de-xuat/vat-tu-sua-chua-chi-tiet/:id" element={<RepairSuppliesDetail />} />
            <Route path="/pm/de-xuat/de-xuat-cap-may-moc-thiet-bi" element={<EquipmentSupply />} />
            <Route path="/pm/de-xuat/cap-may-moc-thiet-bi-chi-tiet/:id" element={<EquipmentSupplyDetail />} />
            <Route path="/pm/bien-ban/bien-ban-ban-giao-vat-tu" element={<EquipmentHandover />} />
            <Route path="/pm/de-xuat/bien-ban-ban-giao-chi-tiet/:id" element={<EquipmentHandoverDetail />} />
            <Route path="/pm/bien-ban/bien-ban-thu-hoi-vat-tu" element={<RecoveryMaterials />} />
            <Route path="/pm/de-xuat/bien-ban-thu-hoi-chi-tiet/:id" element={<RecoveryMaterialsDetail />} />
            <Route path="/pm/bien-ban/bien-ban-nghiem-thu-sau-sua-chua" element={<CheckRepairs />} />
            <Route path="/pm/de-xuat/bien-ban-nghiem-thu-sau-sua-chua-chi-tiet/:id" element={<CheckRepairsDetail />} />
            <Route path="/pm/bien-ban/bien-ban-khao-sat-thiet-bị" element={<ConfirmStatus />} />
            <Route path="/pm/de-xuat/bien-ban-khao-sat-thiet-bị-chi-tiet/:id" element={<ConfirmStatusDetail />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}

export default AppRoute