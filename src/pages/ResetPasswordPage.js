import React from "react";
import ResetPasswordForm from "../components/ResetPasswordForm";
import Navbar from "../components/Navbar";

const ResetPasswordPage = () => {
  return (
    <div>
      <Navbar />
      <ResetPasswordForm />
    </div>
  );
};
export const metadata = { title: "ForgotPassword" };
export default ResetPasswordPage;
