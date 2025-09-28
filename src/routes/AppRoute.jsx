import React from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import NotFoundPage from "../modules/Common/Notfound";
import Review from "../modules/Common/Review";
import Calendar from "../modules/Common/Calendar";
import DashboardProductionControll from "../modules/ProductionControl/Dashboard";
import WareHousePC from "../modules/ProductionControl/WareHousePC/WareHousePC";
import Login from "../modules/Auth/Login/Login";
import ForgotPassword from "../modules/Auth/ForgotPassword/ForgotPassword";
import CheckOTP from "../modules/Auth/ForgotPassword/CheckOTP";
import ChangePassword from "../modules/Auth/ChangePassword/ChangePassword";
import WareHousePCDetail from "../modules/ProductionControl/WareHousePC/WareHousePCDetail";
import KanbanBoard from "../modules/ProductionControl/Tasks/KanbanBoard";
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
import NotificationDetail from "../modules/Common/NotificationDetail";
import ImportWareHouse from "../modules/TechnicalMaterial/Supplies/ImportWareHouse/ImportWareHouse";
import ImportWareHouseDetail from "../modules/TechnicalMaterial/Supplies/ImportWareHouse/ImportWareHouseDetail";
import ExportWareHouse from "../modules/TechnicalMaterial/Supplies/ExportWareHouse/ExportWareHouse";
import ExportWareHouseDetail from "../modules/TechnicalMaterial/Supplies/ExportWareHouse/ExportWareHouseDetail";
import MaterialInspection from "../modules/TechnicalMaterial/Supplies/MaterialInspection/MaterialInspection";
import MaterialInspectionDetail from "../modules/TechnicalMaterial/Supplies/MaterialInspection/MaterialInspectionDetail";
import MaterialEstimate from "../modules/TechnicalMaterial/MaterialEstimate/MaterialEstimate";
import MaterialEstimateDetail from "../modules/TechnicalMaterial/MaterialEstimate/MaterialEstimateDetail";
import ShipRepairPlan from "../modules/Plant/ShipRepairPlan/ShipRepairPlan";
import ShipRepairPlanDetail from "../modules/Plant/ShipRepairPlan/ShipRepairPlanDetail";
import RepairPlan from "../modules/Plant/RepairPlan/RepairPlan";
import RepairPlanDetail from "../modules/Plant/RepairPlan/RepairPlanDetail";
import Repair from "../modules/ProductionControl/Propose/Repair/Repair";
import RepairDetail from "../modules/ProductionControl/Propose/Repair/RepairDetail";
import BuySupplies from "../modules/ProductionControl/Propose/BuySupplies/BuySupplies";
import BuySuppliesDetail from "../modules/ProductionControl/Propose/BuySupplies/BuySuppliesDetail";
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
          <Route
            path="/pm/so-kho-chi-tiet/:id"
            element={<WareHousePCDetail />}
          />
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
            path="/pm/bao-cao/kiem-ke-thiet-bi"
            element={<EquipmentInventory />}
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
            path="/pm/bao-cao/kiem-ke-thiet-bi-chi-tiet/:id"
            element={<EquipmentInventoryDetail />}
          />
          <Route path="/profile" element={<AccountInfo />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/notification-detail/:id"
            element={<NotificationDetail />}
          />
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
          <Route path="/tm/vat-tu/phieu-nhap" element={<ImportWareHouse />} />
          <Route
            path="/tm/vat-tu/phieu-nhap-chi-tiet/:id"
            element={<ImportWareHouseDetail />}
          />
          <Route path="/tm/vat-tu/phieu-xuat" element={<ExportWareHouse />} />
          <Route
            path="/tm/vat-tu/phieu-xuat-chi-tiet/:id"
            element={<ExportWareHouseDetail />}
          />
          <Route
            path="/tm/vat-tu/bien-ban-kiem-tra-vt"
            element={<MaterialInspection />}
          />
          <Route
            path="/tm/vat-tu/bien-ban-kiem-tra-vt-chi-tiet/:id"
            element={<MaterialInspectionDetail />}
          />
          <Route path="/tm/du-tru-vat-tu" element={<MaterialEstimate />} />
          <Route
            path="/tm/du-tru-vat-tu-chi-tiet/:id"
            element={<MaterialEstimateDetail />}
          />
          <Route
            path="/pl/ke-hoach/ke-hoach-tau-vao-sua-chua"
            element={<ShipRepairPlan />}
          />
          <Route
            path="/pl/ke-hoach/ke-hoach-tau-vao-sua-chua-chi-tiet/:id"
            element={<ShipRepairPlanDetail />}
          />
          <Route
            path="/pl/ke-hoach/ke-hoach-sua-chua"
            element={<RepairPlan />}
          />
          <Route
            path="/pl/ke-hoach/ke-hoach-sua-chua-chi-tiet/:id"
            element={<RepairPlanDetail />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoute;
