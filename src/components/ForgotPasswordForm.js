import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import "../styles/auth.css";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
      if (response.success) {
        navigate(`/reset-password?email=${email}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="auth-title">Mot de passe oublié</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Adresse Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-custom">
            Envoyer le code
          </button>
          {message && <p className="message-error">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
