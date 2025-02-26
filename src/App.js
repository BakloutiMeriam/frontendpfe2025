import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes";
import { ProfileProvider } from "./context/ProfileContext";

const App = () => {
  return (
    /*<Router>
      <div>
        <AppRoutes />
      </div>
    </Router>*/
    <GoogleOAuthProvider clientId="VOTRE_CLIENT_ID_GOOGLE">
      <Router>
        <ProfileProvider>
          <AppRoutes />
        </ProfileProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
