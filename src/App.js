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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <ProfileProvider>
          <AppRoutes />
        </ProfileProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
