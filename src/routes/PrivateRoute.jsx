import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const isAuthenticated = useSelector((state) => state.auth.login?.currentUser);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
