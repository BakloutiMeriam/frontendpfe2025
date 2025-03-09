import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPasswordPage";
import ResetPassword from "../pages/ResetPasswordPage";
import CompleteProfile from "../pages/CompleteProfile";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/completer-profile" element={<CompleteProfile />} />
    </Routes>
  );
};

export default AppRoutes;
