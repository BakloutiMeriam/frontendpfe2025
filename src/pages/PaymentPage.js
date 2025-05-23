import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import PaiementService from "../services/PaiementService";
import CommandeService from "../services/commandeService";
import "../styles/paymentPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const { commandeId } = useParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [commande, setCommande] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    // Récupérer les détails de la commande
    const fetchCommandeDetails = async () => {
      try {
        if (!commandeId) {
          setPaymentError("ID de commande manquant");
          return;
        }

        // Utiliser directement getCommandeById au lieu de .data
        const data = await CommandeService.getCommandeById(commandeId);
        setCommande(data);
      } catch (error) {
        console.error("Erreur lors de la récupération de la commande:", error);
        setPaymentError("Impossible de charger les détails de la commande");
      }
    };
    // Initialiser l'intention de paiement
    const initierPaiement = async () => {
      try {
        if (!commandeId) return;
        const data = await PaiementService.initierPaiement(commandeId);
        if (data && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("Réponse API invalide: clientSecret manquant");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du paiement:", error);
        setPaymentError(
          error.message || "Erreur lors de l'initialisation du paiement"
        );
      }
    };

    fetchCommandeDetails();
    initierPaiement();
  }, [commandeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !cardComplete) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirmer le paiement avec Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (result.error) {
        setPaymentError(result.error.message);
        setIsProcessing(false);
      } else if (result.paymentIntent.status === "succeeded") {
        // Informer le backend que le paiement a réussi
        const cardInfo = await elements.getElement(CardElement).card;
        await PaiementService.confirmerPaiement(commandeId, {
          transactionId: result.paymentIntent.id,
          methode: "carte",
          derniers4Chiffres: cardInfo ? cardInfo.last4 : "****",
          nomCarte: cardholderName,
          dateExpiration: cardInfo
            ? `${cardInfo.exp_month}/${cardInfo.exp_year}`
            : "**/**",
        });

        // Rediriger vers la page de confirmation
        navigate(`/commande/${commandeId}/confirmation`);
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      setPaymentError(
        "Une erreur s'est produite lors du traitement du paiement"
      );
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setPaymentError(event.error.message);
    } else {
      setPaymentError(null);
    }
  };

  if (!commande) {
    return (
      <div className="payment-loading">
        Chargement des détails de la commande....
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-details">
        <h2>Détails de la commande</h2>
        <div className="order-summary">
          <p>
            <span>Référence:</span> {commande._id.substring(0, 8).toUpperCase()}
          </p>
          <p>
            <span>Prix total:</span> {commande.prixTotal.toFixed(2)} €
          </p>
        </div>
      </div>

      <div className="payment-method">
        <h2>Mode de paiement</h2>
        <div className="card-input">
          <label htmlFor="cardholder-name">Nom sur la carte</label>
          <input
            id="cardholder-name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Nom complet"
            required
          />
        </div>

        <div className="card-element-container">
          <label>Informations de carte</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
            onChange={handleCardChange}
          />
        </div>

        {paymentError && <div className="payment-error">{paymentError}</div>}

        <div className="secure-payment-info">
          <i className="fas fa-lock"></i>
          <span>Paiement sécurisé SSL - Vos données sont protégées</span>
        </div>
      </div>

      <div className="payment-actions">
        <button
          type="submit"
          disabled={!stripe || isProcessing || !cardComplete || !cardholderName}
          className="pay-button"
        >
          {isProcessing
            ? "Traitement..."
            : `Payer ${commande.prixTotal.toFixed(2)} €`}
        </button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  return (
    <>
      <Navbar />
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <h1>Paiement sécurisé</h1>
          </div>
          <div className="back-link-container">
            <Link to="/mes-commandes" className="back-link">
              <span className="back-arrow">&#8592;</span> Retour à mes commandes
            </Link>
          </div>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default PaymentPage;
