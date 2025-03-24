import React from "react";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import Navbar from "../components/Navbar";

const ForgotPasswordPage = () => {
  return (
    <div>
      <Navbar />
      <ForgotPasswordForm />
    </div>
  );
};

export const metadata = { title: "ForgotPassword" };
export default ForgotPasswordPage;
