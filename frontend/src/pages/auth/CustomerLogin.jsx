import { Navigate } from "react-router-dom";

function CustomerLogin() {
  return <Navigate to="/auth/login" replace />;
}

export default CustomerLogin;
