import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ProfileProvider } from "./context/ProfileContext";

const App = () => {
  return (
    /*<Router>
      <div>
        <AppRoutes />
      </div>
    </Router>*/
    <Router>
      <ProfileProvider>
        <AppRoutes />
      </ProfileProvider>
    </Router>
  );
};

export default App;
