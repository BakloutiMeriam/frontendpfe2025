import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "../styles/reset.css";

const ResetPasswordForm = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword(email, resetCode, newPassword);
      setMessage(response.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="reset-container">
      {/* Partie gauche (illustration) */}
      <div className="reset-left">
        <div>
          <h1>Réinitialisation du mot de passe</h1>
          <p>
            Entrez votre code de réinitialisation et votre nouveau mot de passe.
          </p>
          <img src="/images/f5.jpg" alt="Illustration" />
        </div>
      </div>

      {/* Partie droite (formulaire) */}
      <div className="reset-right">
        <div className="reset-card">
          {/* Logo centré */}
          <div className="reset-logo2">
            <img src="/images/logo.jpg" alt="Logo" />
          </div>

          <h3 className="reset-title">Réinitialiser le mot de passe</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="reset-form-control"
                value={email}
                disabled
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="reset-form-control"
                placeholder="Entrez le code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="reset-form-control"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="reset-btn-custom">
              Réinitialiser
            </button>
            {/* Message d'erreur */}
            {message && <p className="reset-message-error">{message}</p>}
          </form>

          {/* Lien vers la page de login */}
          <p className="reset-login-link">
            <a href="/login">Retour à la page de connexion</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
