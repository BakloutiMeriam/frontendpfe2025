import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleLogin } from "@react-oauth/google";
import React from "react";

const Login = () => {
  const { login, user, logout } = useContext(AuthContext);
  const [errors, setErrors] = useState({ email: "", mdp: "" });
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { email: "", mdp: "" };

    if (!email || !mdp) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    if (!validatePassword(mdp)) {
      newErrors.mdp = "Le mot de passe doit comporter au moins 6 caractères.";
      setErrors(newErrors);
      return;
    }

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

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await fetch("http://localhost:3000/api/user/googleAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Échec de l'authentification Google");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.photo) {
        localStorage.setItem("photo", data.user.photo);
      }
      data.isNewUser
        ? navigate("/completer-profile", { state: { user: data.user } })
        : navigate("/dashboard");
    } catch (error) {
      console.error("Erreur d'authentification Google", error);
    }
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
                : "Administrateur"}{" "}
              !
            </p>
            <button className="btn btn-secondary mt-3" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="alert alert-danger">{errors.general}</div>
            )}
            <div className="mb-3">
              <label className="form-label">Email :</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe :</label>
              <input
                type="password"
                className={`form-control ${errors.mdp ? "is-invalid" : ""}`}
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
                required
              />
              {errors.mdp && (
                <div className="invalid-feedback">{errors.mdp}</div>
              )}
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Se connecter
            </button>
          </form>
        )}
        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            style={{ textDecoration: "none" }}
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </button>
        </div>
        <div className="login-container">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={(error) => console.error("Google login error:", error)}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
