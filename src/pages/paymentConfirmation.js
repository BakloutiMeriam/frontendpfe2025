import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import CommandeService from "../services/commandeService";
import PaiementService from "../services/PaiementService";
import "../styles/PaymentConfirmation.css";

const PaymentConfirmation = () => {
  const { commandeId } = useParams();
  const [commande, setCommande] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommandeAndPayment = async () => {
      try {
        const commandeData = await CommandeService.getCommandeById(commandeId);
        setCommande(commandeData);

        // Récupérer les informations de paiement associées à cette commande
        const paiements = await PaiementService.getHistoriquePaiements();
        const relatedPayment = paiements.find((p) => p.commande === commandeId);

        if (relatedPayment) {
          setPayment(relatedPayment);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les détails de confirmation");
        setLoading(false);
      }
    };

    fetchCommandeAndPayment();
  }, [commandeId]);

  if (loading) {
    return <div className="payment-confirmation-loading">Chargement...</div>;
  }

  if (error) {
    return <div className="payment-confirmation-error">{error}</div>;
  }

  return (
    <div className="payment-confirmation-page">
      <div className="payment-confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>Paiement confirmé</h1>
          <p className="confirmation-message">
            Votre paiement a été traité avec succès. Merci pour votre commande!
          </p>
        </div>

        <div className="confirmation-details">
          <h2>Détails de la transaction</h2>
          <div className="confirmation-info">
            <div className="info-item">
              <span className="info-label">Référence de commande:</span>
              <span className="info-value">
                {commande?._id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Date:</span>
              <span className="info-value">
                {payment?.dateTransaction
                  ? new Date(payment.dateTransaction).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : new Date().toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Montant:</span>
              <span className="info-value">
                {commande?.prixTotal.toFixed(2)} €
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Méthode de paiement:</span>
              <span className="info-value">
                {payment?.methode === "carte"
                  ? `Carte bancaire se terminant par ${
                      payment?.infosPaiement?.derniers4Chiffres || "****"
                    }`
                  : payment?.methode || "Carte bancaire"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut:</span>
              <span className="info-value status-success">Payé</span>
            </div>
            {payment?.transactionId && (
              <div className="info-item">
                <span className="info-label">ID Transaction:</span>
                <span className="info-value transaction-id">
                  {payment.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/mes-commandes" className="primary-button">
            Voir mes réservations
          </Link>
          <Link to="/" className="secondary-button">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
