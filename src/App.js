import AppRoutes from "./routes/AppRoutes";
import { GoogleOAuthProvider } from "@react-oauth/google";
const App = () => {
  return (
    <GoogleOAuthProvider clientId="VOTRE_CLIENT_ID_GOOGLE">
      <AppRoutes />
    </GoogleOAuthProvider>
  );
};

export default App;
