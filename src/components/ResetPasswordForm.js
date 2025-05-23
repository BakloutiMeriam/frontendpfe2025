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
      {/* Decorative blobs are created with CSS ::before and ::after */}

      <div className="reset-content">
        <div className="reset-card">
          <div className="reset-logo2">
            <img src="/images/logo.jpg" alt="Logo" />
          </div>

          <h3 className="reset-title">Réinitialisation du mot de passe</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="reset-label">Email</label>
              <input
                type="email"
                className="reset-form-control"
                value={email}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="reset-label">Code de réinitialisation</label>
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
              <label className="reset-label">Nouveau mot de passe</label>
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

            {message && (
              <p
                className={
                  message.includes("succès")
                    ? "reset-message-success"
                    : "reset-message-error"
                }
              >
                {message}
              </p>
            )}
          </form>

          <div className="reset-login-link">
            <a href="/login">Retour à la page de connexion</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
