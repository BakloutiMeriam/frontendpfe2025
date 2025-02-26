import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import LoginForm from "../components/loginForm";
import React from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

const Login = () => {
  const { login, user, logout } = useContext(AuthContext);
  const [errors, setErrors] = useState({ email: "", mdp: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleSubmit = async (email, mdp) => {
    const newErrors = { email: "", mdp: "" };

    try {
      await login(email, mdp);
    } catch (error) {
      if (error.message.includes("Email")) {
        newErrors.email = error.message;
      } else if (error.message.includes("Mot de passe")) {
        newErrors.mdp = error.message;
      } else {
        newErrors.general = "Une erreur est survenue. Veuillez réessayer.";
      }
      setErrors(newErrors);
    }
  };

  const handleLogout = () => {
    logout();
  };
  const handleGoogleLoginSuccess = (response) => {
    console.log("Google login success:", response);
    const token = response.credential;
    // Simuler la récupération des infos utilisateur depuis Google
    const userData = { name: "Utilisateur Google", role: "client", token };

    dispatch(loginSuccess(userData)); // Stocker l'utilisateur dans Redux
    login(token); // Si nécessaire, appeler la fonction de contexte Auth
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google login error:", error);
  };
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Connexion</h2>
        {user ? (
          <div className="text-center">
            <p className="text-success">
              Bienvenue,{" "}
              {user.role === "client"
                ? "Client"
                : user.role === "proprietaire"
                ? "Propriétaire"
                : "Administrateur"}
               !
            </p>
            <button className="btn btn-secondary mt-3" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        ) : (
          <LoginForm
            login={login}
            errors={errors}
            setErrors={setErrors}
            handleSubmit={handleSubmit}
          />
        )}

        {/* Mot de passe oublié */}
        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            style={{ textDecoration: "none" }}
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </button>
        </div>
        {/* Se connecter avec Google */}
        <div className="text-center mt-3">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
