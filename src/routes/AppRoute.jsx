import React from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import NotFoundPage from "../modules/Common/Notfound";
import Review from "../modules/Common/Review";
import Calendar from "../modules/Common/Calendar";
import DashboardProductionControll from "../modules/ProductionControl/Dashboard";
import WareHousePC from "../modules/ProductionControl/WareHousePC/WareHousePC";
import Projects from "../modules/ProductionControl/Project/Projects";
import ProgressProject from "../modules/ProductionControl/ProgressProject/ProgressProject";
import Delivery from "../modules/ProductionControl/Delivery/Delivery";
import Login from "../modules/Auth/Login/Login";
import ForgotPassword from "../modules/Auth/ForgotPassword/ForgotPassword";
import CheckOTP from "../modules/Auth/ForgotPassword/CheckOTP";
import ChangePassword from "../modules/Auth/ChangePassword/ChangePassword";
import WareHousePCDetail from "../modules/ProductionControl/WareHousePC/WareHousePCDetail";
import ProjectsDetail from "../modules/ProductionControl/Project/ProjectsDetail";
import ProgressProjectDetail from "../modules/ProductionControl/ProgressProject/ProgressProjectDetail";
import DeliveryDetail from "../modules/ProductionControl/Delivery/DeliveryDetail";
import KanbanBoard from "../modules/ProductionControl/Tasks/KanbanBoard";
import Repair from "../modules/ProductionControl/Propose/Repair/Repair";
import RepairDetail from "../modules/ProductionControl/Propose/Repair/RepairDetail";
import Liquidation from "../modules/ProductionControl/Propose/Liquidation/Liquidation";
import LiquidationDetail from "../modules/ProductionControl/Propose/Liquidation/LiquidationDetail";
import BuySupplies from "../modules/ProductionControl/Propose/BuySupplies/BuySupplies";
import BuySuppliesDetail from "../modules/ProductionControl/Propose/BuySupplies/BuySuppliesDetail";
import RepairSupplies from "../modules/ProductionControl/Propose/RepairSupplies/RepairSupplies";
import RepairSuppliesDetail from "../modules/ProductionControl/Propose/RepairSupplies/RepairSuppliesDetail";
import EquipmentSupply from "../modules/ProductionControl/Propose/EquipmentSupply/EquipmentSupply";
import EquipmentSupplyDetail from "../modules/ProductionControl/Propose/EquipmentSupply/EquipmentSupplyDetail";
import EquipmentHandover from "../modules/ProductionControl/Protocol/EquipmentHandover/EquipmentHandover";
import EquipmentHandoverDetail from "../modules/ProductionControl/Protocol/EquipmentHandover/EquipmentHandoverDetail";
import RecoveryMaterials from "../modules/ProductionControl/Protocol/RecoveryMaterials/RecoveryMaterials";
import RecoveryMaterialsDetail from "../modules/ProductionControl/Protocol/RecoveryMaterials/RecoveryMaterialsDetail";
import CheckRepairs from "../modules/ProductionControl/Protocol/CheckRepairs/CheckRepairs";
import CheckRepairsDetail from "../modules/ProductionControl/Protocol/CheckRepairs/CheckRepairsDetail";
import ConfirmStatus from "../modules/ProductionControl/Protocol/ConfirmStatus/ConfirmStatus";
import ConfirmStatusDetail from "../modules/ProductionControl/Protocol/ConfirmStatus/ConfirmStatusDetail";
import EquipmentInventory from "../modules/ProductionControl/Reports/EquipmentInventory/EquipmentInventory";
import EquipmentInventoryDetail from "../modules/ProductionControl/Reports/EquipmentInventory/EquipmentInventoryDetail";
import AccountInfo from "../modules/Auth/Account";
import Notifications from "../modules/Common/Notifications";
import AssignmentSlip from "../modules/Plant/AssignmentSlip/AssignmentSlip";
import AssignmentSlipDetail from "../modules/Plant/AssignmentSlip/AssignmentSlipDetail";
import Plants from "../modules/Plant/Plants/Plants";
import PlantsDetail from "../modules/Plant/Plants/PlantDetail";
import TestRunPlan from "../modules/Plant/TestRunPlan/TestRunPlan";
import TestRunPlanDetail from "../modules/Plant/TestRunPlan/TestRunPlanDetail";
import ReceptionMinutes from "../modules/Plant/ReceptionMinutes/ReceptionMinutes";
import ReceptionMinutesDetail from "../modules/Plant/ReceptionMinutes/ReceptionMinutesDetail";
import PrivateRoute from "./PrivateRoute";
import KTVTCN from "../modules/Files/KT-VT-CN/KTVTCN";
import TC from "../modules/Files/TC/TC";
import DDSX from "../modules/Files/DDSX/DDSX";
import CTHC from "../modules/Files/CT-HC/CTHC";
import KHKD from "../modules/Files/KH-KD/KHKD";
import JobRequirements from "../modules/TechnicalMaterial/JobRequirements/JobRequirements";
import JobRequirementsDetail from "../modules/TechnicalMaterial/JobRequirements/JobRequirementsDetail";
import Employees from "../modules/Political/HRM/Employees/Employees";
import EmployeeDetail from "../modules/Political/HRM/Employees/EmployeeDetail";
import LeaveRequest from "../modules/Political/HRM/LeaveRequest/LeaveRequest";
import LeaveRequestDetail from "../modules/Political/HRM/LeaveRequest/LeaveRequestDetail";
import RiceReport from "../modules/Finaces/RiceReport/RiceReport";
import RiceReportDetail from "../modules/Finaces/RiceReport/RiceReportDetail";
import Timekeeping from "../modules/Finaces/Timekeeping/Timekeeping";
import TimekeepingDetail from "../modules/Finaces/Timekeeping/TimekeepingDetail";
import DeviceManagementDetail from "../modules/ProductionControl/Reports/DeviceManagement/DeviceManagementDetail";
import DeviceManagement from "../modules/ProductionControl/Reports/DeviceManagement/DeviceManagement";

function AppRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/check-otp" element={<CheckOTP />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route path="/review" element={<Review />} />
          <Route path="/calendar" element={<Calendar />} />
          {/* điều độ sản xuất */}
          <Route
            path="/pm/dashboard"
            element={<DashboardProductionControll />}
          />
          <Route path="/pm/so-kho" element={<WareHousePC />} />
          <Route path="/pm/du-an" element={<Projects />} />
          <Route path="/pm/tien-do" element={<ProgressProject />} />
          <Route
            path="/pm/so-kho-chi-tiet/:id"
            element={<WareHousePCDetail />}
          />
          <Route path="/pm/du-an-chi-tiet/:id" element={<ProjectsDetail />} />
          <Route
            path="/pm/tien-do-du-an-chi-tiet/:id"
            element={<ProgressProjectDetail />}
          />
          <Route
            path="/pm/so-giao-nhan-chi-tiet/:id"
            element={<DeliveryDetail />}
          />
          <Route path="/pm/so-giao-nhan" element={<Delivery />} />
          <Route path="/pm/cong-viec" element={<KanbanBoard />} />
          <Route
            path="/pm/de-xuat/de-xuat-sua-chua-thanh-ly"
            element={<Repair />}
          />
          <Route
            path="/pm/de-xuat/sua-chua-chi-tiet/:id"
            element={<RepairDetail />}
          />
          <Route
            path="/pm/de-xuat/de-xuat-thanh-ly"
            element={<Liquidation />}
          />
          <Route
            path="/pm/de-xuat/thanh-ly-chi-tiet/:id"
            element={<LiquidationDetail />}
          />
          <Route
            path="/pm/de-xuat/de-xuat-mua-cap-sua"
            element={<BuySupplies />}
          />
          <Route
            path="/pm/de-xuat/mua-vat-tu-ccdc-chi-tiet/:id"
            element={<BuySuppliesDetail />}
          />
          <Route
            path="/pm/de-xuat/de-xuat-vat-tu-sua-chua"
            element={<RepairSupplies />}
          />
          <Route
            path="/pm/de-xuat/vat-tu-sua-chua-chi-tiet/:id"
            element={<RepairSuppliesDetail />}
          />
          <Route
            path="/pm/de-xuat/de-xuat-cap-may-moc-thiet-bi"
            element={<EquipmentSupply />}
          />
          <Route
            path="/pm/de-xuat/cap-may-moc-thiet-bi-chi-tiet/:id"
            element={<EquipmentSupplyDetail />}
          />
          <Route
            path="/pm/bien-ban/bien-ban-ban-giao-thu-hoi"
            element={<EquipmentHandover />}
          />
          <Route
            path="/pm/de-xuat/bien-ban-ban-giao-chi-tiet/:id"
            element={<EquipmentHandoverDetail />}
          />
          <Route
            path="/pm/bien-ban/bien-ban-thu-hoi-vat-tu"
            element={<RecoveryMaterials />}
          />
          <Route
            path="/pm/de-xuat/bien-ban-thu-hoi-chi-tiet/:id"
            element={<RecoveryMaterialsDetail />}
          />
          <Route
            path="/pm/bien-ban/bien-ban-nghiem-thu-sau-sua-chua"
            element={<CheckRepairs />}
          />
          <Route
            path="/pm/de-xuat/bien-ban-nghiem-thu-sau-sua-chua-chi-tiet/:id"
            element={<CheckRepairsDetail />}
          />
          <Route
            path="/pm/bien-ban/bien-ban-khao-sat-thiet-bi"
            element={<ConfirmStatus />}
          />
          <Route
            path="/pm/de-xuat/bien-ban-khao-sat-thiet-bi-chi-tiet/:id"
            element={<ConfirmStatusDetail />}
          />
          <Route
            path="/pm/bao-cao/kiem-ke-thiet-bi"
            element={<EquipmentInventory />}
          />
          <Route
            path="/pm/bao-cao/kiem-ke-thiet-bi-chi-tiet/:id"
            element={<EquipmentInventoryDetail />}
          />
          <Route path="/profile" element={<AccountInfo />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* kh-kd */}
          <Route path="/pl/phieu-giao-viec" element={<AssignmentSlip />} />
          <Route
            path="/pl/phieu-giao-viec-chi-tiet/:id"
            element={<AssignmentSlipDetail />}
          />
          <Route path="/pl/ke-hoach/ke-hoach" element={<Plants />} />
          <Route
            path="/pl/ke-hoach/ke-hoach-chi-tiet/:id"
            element={<PlantsDetail />}
          />
          <Route
            path="/pl/ke-hoach/ke-hoach-chay-thu"
            element={<TestRunPlan />}
          />
          <Route
            path="/pl/ke-hoach/ke-hoach-chay-thu-chi-tiet/:id"
            element={<TestRunPlanDetail />}
          />
          <Route
            path="/pl/bien-ban/bien-ban-tiep-nhan"
            element={<ReceptionMinutes />}
          />
          <Route
            path="/pl/bien-ban/bien-ban-tiep-nhan-chi-tiet/:id"
            element={<ReceptionMinutesDetail />}
          />
          <Route path="/pl/task" element={<KanbanBoard />} />
          <Route path="/hs/kt-vt-cn" element={<KTVTCN />} />
          <Route path="/hs/ddsx" element={<DDSX />} />
          <Route path="/hs/tc" element={<TC />} />
          <Route path="/hs/kh-kd" element={<KHKD />} />
          <Route path="/hs/ct-hc" element={<CTHC />} />
          <Route path="/tm/task" element={<KanbanBoard />} />
          <Route path="/fn/task" element={<KanbanBoard />} />
          <Route path="/pt/task" element={<KanbanBoard />} />
          <Route path="/tm/yeu-cau-cong-viec" element={<JobRequirements />} />
          <Route
            path="/tm/yeu-cau-cong-viec-chi-tiet/:id"
            element={<JobRequirementsDetail />}
          />
          <Route path="/pt/nhan-su/ho-so-nhan-vien" element={<Employees />} />
          <Route
            path="/pt/nhan-su/ho-so-nhan-vien-chi-tiet/:id"
            element={<EmployeeDetail />}
          />
          <Route path="/pt/nhan-su/nghi-phep" element={<LeaveRequest />} />
          <Route
            path="/pt/nhan-su/nghi-phep-chi-tiet/:id"
            element={<LeaveRequestDetail />}
          />
          <Route path="/fn/nhan-su/bao-com" element={<RiceReport />} />
          <Route
            path="/fn/nhan-su/bao-com-chi-tiet/:id"
            element={<RiceReportDetail />}
          />

          <Route path="/fn/nhan-su/cham-cong" element={<Timekeeping />} />
          <Route
            path="/fn/nhan-su/cham-cong-chi-tiet/:id"
            element={<TimekeepingDetail />}
          />
          <Route
            path="/pm/bao-cao/quan-ly-thiet-bi"
            element={<DeviceManagement />}
          />
          <Route
            path="/pm/bao-cao/quan-ly-thiet-bi-chi-tiet/:id"
            element={<DeviceManagementDetail />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoute;
