/*import React, { useState } from "react";
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

export default ForgotPasswordForm;*/
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importez Link pour le lien
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
      <div className="reset-left">
        <div>
          <h1>Mot de passe oublié ?</h1>
          <p>
            Pas de panique ! l'équipe stayzy vous aiderons à récupérer votre
            compte.
          </p>
          <img src="/images/f3.jpg" alt="Illustration" />
        </div>
      </div>
      <div className="reset-right">
        <div className="reset-card">
          <div className="reset-logo2">
            <img src="/images/logo.jpg" alt="Logo" />
          </div>
          <h3 className="reset-title">Mise à jour du mot de passe</h3>
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
            {message && <p className="reset-message-error">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
/*<p className="reset-login-link">
              <Link to="/login">Retour à la page de connexion</Link>
            </p>*/
