import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Garde un seul import Bootstrap
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Provider } from "react-redux";
import store from "./redux/store";
const root = ReactDOM.createRoot(document.getElementById("root")); // Utilisation de createRoot
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
