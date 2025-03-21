import React from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/confirmation.css"; // Vous devrez créer ce fichier CSS

const ConfirmationPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user || !user.role || user.role.toLowerCase() !== "proprietaire") {
    navigate("/login");
    return null;
  }

  return (
    <div className="pending-approval-container">
      <div className="pending-approval-card">
        <div className="pending-icon">
          <i className="fas fa-clock"></i>
        </div>
        <h2>Compte en attente d'approbation</h2>
        <p>
          Merci d'avoir créé un compte propriétaire sur notre plateforme. Votre
          demande est actuellement en cours d'examen par notre équipe
          administrative.
        </p>
        <div className="pending-details">
          <p>
            <strong>Nom :</strong> {user.prenom} {user.nom}
          </p>
          <p>
            <strong>Email :</strong> {user.email}
          </p>
          <p>
            <strong>Statut :</strong>{" "}
            <span className="status-pending">En attente</span>
          </p>
        </div>
        <div className="pending-info">
          <h3>Que se passe-t-il maintenant ?</h3>
          <ol>
            <li>Notre équipe vérifie vos informations</li>
            <li>
              Vous recevrez un email à l'adresse <strong>{user.email}</strong>{" "}
              lorsque votre compte sera approuvé
            </li>
            <li>
              Vous pourrez alors vous connecter et accéder à toutes les
              fonctionnalités de propriétaire
            </li>
          </ol>
        </div>
        <p className="pending-note">
          Le processus d'approbation prend généralement 1 à 2 jours ouvrables.
          Si vous avez des questions, n'hésitez pas à contacter notre support à
          <a href="mailto:contactlemonde494@gmail.com">
            {" "}
            contactlemonde494@gmail.com
          </a>
        </p>
        <div className="pending-actions">
          <button className="btn btn-primary" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
