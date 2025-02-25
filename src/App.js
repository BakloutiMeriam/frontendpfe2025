import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <GoogleOAuthProvider clientId="VOTRE_CLIENT_ID_GOOGLE">
      <Router>
        <AppRoutes />
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
