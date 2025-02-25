// ResetPasswordForm.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "../styles/auth.css";

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
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="auth-title">Réinitialiser le mot de passe</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Adresse Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Code de réinitialisation</label>
            <input
              type="text"
              className="form-control"
              placeholder="Entrez le code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-custom">
            Réinitialiser
          </button>
          {message && <p className="message-error">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
