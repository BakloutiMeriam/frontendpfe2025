/*import React from "react";
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

export default App;*/
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes";
import { ProfileProvider } from "./context/ProfileContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import ChatbotContainer from "./components/chatbot/ChatbotContainer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles/chatbot.css";

// Composant qui affiche le chatbot conditionnellement
const ConditionalChatbot = () => {
  const { user } = React.useContext(AuthContext);

  // Afficher le chatbot uniquement si l'utilisateur est un client
  return user && user.role === "client" ? <ChatbotContainer /> : null;
};

const App = () => {
  return (
    <>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <Router>
          <AuthProvider>
            <ProfileProvider>
              <NotificationProvider>
                <ChatbotProvider>
                  <AppRoutes />
                  <ConditionalChatbot />
                </ChatbotProvider>
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
