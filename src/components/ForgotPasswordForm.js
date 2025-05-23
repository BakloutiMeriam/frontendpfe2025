import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import "../styles/reset.css";

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
    <div className="reset-container">
      {/* Decorative blobs are created with CSS ::before and ::after */}

      <div className="reset-content">
        <div className="reset-card">
          <div className="reset-logo2">
            <img src="/images/logo.jpg" alt="Logo" />
          </div>

          <h3 className="reset-title">Mot de passe oublié</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="reset-label">
                Nous vous enverrons un code de réinitialisation de votre mot de
                passe par e-mail.
              </label>
              <input
                type="email"
                className="reset-form-control"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="reset-btn-custom">
              Envoyer le code
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

export default ForgotPasswordForm;
