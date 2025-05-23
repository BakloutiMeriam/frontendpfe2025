import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import CommandeService from "../services/commandeService";
import PaiementService from "../services/PaiementService";
import "../styles/PaymentConfirmation.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PaymentConfirmation = () => {
  const { commandeId } = useParams();
  const [commande, setCommande] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  // Fonction pour générer et télécharger le reçu de paiement
  const handleDownloadReceipt = async () => {
    setIsGeneratingPdf(true);

    try {
      // Création d'un élément qui contiendra le contenu du reçu
      const receiptContent = document.createElement("div");

      // Formatage de la date
      const transactionDate = payment?.dateTransaction
        ? new Date(payment.dateTransaction).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

      // Charger le logo et le convertir en base64
      const loadLogoAsBase64 = async () => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous"; // Important pour éviter les problèmes CORS
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => {
            console.error("Erreur lors du chargement de l'image");
            // Logo de secours en cas d'erreur
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 60;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#4a90e2";
            ctx.fillRect(0, 0, 200, 60);
            ctx.font = "bold 30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Srayzy", 100, 30);
            resolve(canvas.toDataURL("image/png"));
          };
          // Utiliser un chemin absolu pour l'image
          img.src = "/images/logo2.png";
        });
      };

      // Obtenir le logo en base64
      const logoBase64 = await loadLogoAsBase64();

      // Création du contenu HTML du reçu avec le logo intégré
      receiptContent.innerHTML = `
        <html>
          <head>
            <title>Reçu de Paiement - ${commande?._id
              .substring(0, 8)
              .toUpperCase()}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 30px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
              }
              .logo-container {
                margin-bottom: 15px;
                text-align: center;
              }
              .logo-image {
                max-width: 200px;
                height: auto;
              }
              .receipt-title {
                font-size: 20px;
                color: #555;
              }
              .info-section {
                margin-bottom: 25px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px dashed #eee;
              }
              .info-label {
                font-weight: bold;
                color: #666;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #999;
              }
              .status-paid {
                color: #28a745;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="logo-container">
                  <img class="logo-image" src="${logoBase64}" alt="Srayzy Logo" />
                </div>
                <div class="receipt-title">Reçu de Paiement</div>
              </div>
              
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Référence de commande:</span>
                  <span>${commande?._id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date de transaction:</span>
                  <span>${transactionDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Montant total:</span>
                  <span>${commande?.prixTotal.toFixed(2)} €</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Méthode de paiement:</span>
                  <span>${
                    payment?.methode === "carte"
                      ? `Carte bancaire se terminant par ${
                          payment?.infosPaiement?.derniers4Chiffres || "****"
                        }`
                      : payment?.methode || "Carte bancaire"
                  }</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut:</span>
                  <span class="status-paid">Payé</span>
                </div>
                ${
                  payment?.transactionId
                    ? `
                <div class="info-row">
                  <span class="info-label">ID Transaction:</span>
                  <span>${payment.transactionId}</span>
                </div>
                `
                    : ""
                }
              </div>
              
              <div class="footer">
                <p>Ce reçu est généré automatiquement et ne nécessite pas de signature.</p>
                <p>Merci de votre confiance !</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Conversion du contenu HTML en Blob
      const blob = new Blob([receiptContent.innerHTML], { type: "text/html" });

      // Création d'un URL pour le blob
      const fileURL = URL.createObjectURL(blob);

      // Création d'un élément <a> pour le téléchargement
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;
      downloadLink.download = `recu-paiement-${commande?._id
        .substring(0, 8)
        .toUpperCase()}.html`;

      // Déclenchement du téléchargement
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Nettoyage
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Erreur lors de la génération du reçu:", err);
      alert("Une erreur est survenue lors de la génération du reçu.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return <div className="payment-confirmation-loading">Chargement...</div>;
  }

  if (error) {
    return <div className="payment-confirmation-error">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="payment-confirmation-page">
        <div className="payment-confirmation-container">
          <div className="confirmation-header">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Paiement confirmé</h1>
            <p className="confirmation-message">
              Votre paiement a été traité avec succès. Merci pour votre
              commande!
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
            <div className="action-buttons-container">
              <button
                className="action-button download-receipt-button"
                onClick={handleDownloadReceipt}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <span>Génération en cours...</span>
                ) : (
                  <>
                    <i className="fas fa-download"></i> Télécharger le reçu
                  </>
                )}
              </button>

              <Link
                to="/mes-commandes"
                className="action-button primary-button"
              >
                <i className="fas fa-list"></i> Réservations
              </Link>

              <Link to="/" className="action-button secondary-button">
                <i className="fas fa-home"></i> Accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentConfirmation;
