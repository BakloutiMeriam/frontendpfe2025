/*import React from "react";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div>
      <ForgotPasswordForm />
    </div>
  );
};
export const metadata = { title: "ForgotPassword" };
export default ForgotPasswordPage;*/
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
