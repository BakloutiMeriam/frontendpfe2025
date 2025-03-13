import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "../pages/Login";

import ForgotPassword from "../pages/ForgotPasswordPage";
import ResetPassword from "../pages/ResetPasswordPage";
import Register from "../pages/Register";
import CompleteProfile from "../pages/CompleteProfile";
import CompleteProfileGoogle from "../pages/CompleteProfileGoogle";
import UserList from "../pages/UserListPage";
import ProfileAdmin from "../pages/ProfileAdmin";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/completer-profil/:userId" element={<CompleteProfile />} />
      <Route
        path="/completer-profileGoogle"
        element={<CompleteProfileGoogle />}
      />
      <Route path="/users" element={<UserList />} />
      <Route path="/profileAdmin" element={<ProfileAdmin />} />
    </Routes>
  );
};

export default AppRoutes;
