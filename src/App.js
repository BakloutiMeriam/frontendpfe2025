import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes";
import { ProfileProvider } from "./context/ProfileContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
const App = () => {
  return (
    <>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <Router>
          <AuthProvider>
            <ProfileProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </ProfileProvider>
          </AuthProvider>
        </Router>
      </GoogleOAuthProvider>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default App;
