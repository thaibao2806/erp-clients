import Calendar from "../modules/Common/Calendar";
import Review from "../modules/Common/Review";
import DashboardProductionControll from "../modules/ProductionControl/Dashboard";


export const approutes = [
  { path: "/review", element: <Review /> },
  { path: "/calendar", element: <Calendar /> },
  { path: "/pm/dashboard", element: <DashboardProductionControll /> },
]