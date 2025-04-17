import React, { useEffect, useState } from "react";
import "../styles/alert.css"; // Vous devrez créer ce fichier CSS

const SuccessAlert = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Vérifier si un logement vient d'être créé
    const logementCreated = localStorage.getItem("logementCreated");

    if (logementCreated === "true") {
      setVisible(true);

      // Supprimer l'indicateur après l'avoir utilisé
      localStorage.removeItem("logementCreated");

      // Faire disparaître l'alerte après 5 secondes
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="successs-alert">
      <div className="successs-alert-content">
        <div className="successs-icon">✓</div>
        <div className="successs-message">
          <h3>Félicitations!</h3>
          <p>Votre logement a été ajouté avec succès</p>
        </div>
        {/* Bouton de fermeture supprimé */}
      </div>
    </div>
  );
};

export default SuccessAlert;
