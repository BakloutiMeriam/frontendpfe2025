import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reservationService } from "../services/reservationService";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FaCalendarAlt,
  FaUsers,
  FaArrowLeft,
  FaHome,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCreditCard,
  FaRegClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "../styles/ReservationDetail.css";
import NavbarHome from "../components/NavbarHome.js";

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchReservationDetail = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getReservation(id);
        setReservation(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement de la réservation:", err);
        setError(
          "Impossible de charger les détails de la réservation. Veuillez réessayer plus tard."
        );
        setLoading(false);
      }
    };

    if (id) {
      fetchReservationDetail();
    }
  }, [id]);

  const handleCancelReservation = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible."
      )
    ) {
      try {
        setCancelling(true);
        await reservationService.cancelReservation(id);
        setReservation({ ...reservation, statut: "annulée" });
        setCancelling(false);
      } catch (error) {
        console.error("Erreur lors de l'annulation:", error);
        alert("Erreur lors de l'annulation de la réservation");
        setCancelling(false);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case "confirmée":
        return "reservation-badge confirmed";
      case "en attente":
        return "reservation-badge pending";
      case "annulée":
        return "reservation-badge cancelled";
      case "terminée":
        return "reservation-badge completed";
      default:
        return "reservation-badge";
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "confirmée":
        return <FaCheckCircle className="status-icon" />;
      case "en attente":
        return <FaRegClock className="status-icon" />;
      case "annulée":
        return <FaTimesCircle className="status-icon" />;
      case "terminée":
        return <FaCheckCircle className="status-icon" />;
      default:
        return <FaInfoCircle className="status-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="reservation-detail-container">
        <div className="reservation-detail-loader">
          <div className="spinner"></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-detail-container">
        <div className="reservation-detail-error">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="reservation-back-btn">
            <FaArrowLeft /> Retour aux réservations
          </button>
        </div>
      </div>
    );
  }

  if (!reservation) return null;

  const nombreNuits = differenceInDays(
    new Date(reservation.dateFin),
    new Date(reservation.dateDebut)
  );

  return (
    <>
      <NavbarHome />
      <div className="reservation-detail-container">
        <div className="reservation-detail-wrapper">
          <div className="reservation-detail-nav">
            <button
              onClick={() => navigate(-1)}
              className="reservation-back-btn"
            >
              <FaArrowLeft /> Retour
            </button>
            <h1 className="reservation-detail-heading">
              Détails de votre réservation
            </h1>
          </div>

          <div className="reservation-detail-card">
            <div className="reservation-detail-header">
              <div className="reservation-status-wrapper">
                <span className={getStatusBadgeClass(reservation.statut)}>
                  {getStatusIcon(reservation.statut)}{" "}
                  {reservation.statut.charAt(0).toUpperCase() +
                    reservation.statut.slice(1)}
                </span>
              </div>

              <div className="reservation-property-details">
                <div className="reservation-property-image">
                  {reservation.logement.photoprincipale ? (
                    <img
                      src={
                        reservation.logement.photoprincipale.startsWith("data:")
                          ? reservation.logement.photoprincipale
                          : reservation.logement.photoprincipale.startsWith(
                              "http://localhost:3000/uploads/"
                            )
                          ? reservation.logement.photoprincipale
                          : `/uploads/${reservation.logement.photoprincipale}`
                      }
                      alt={reservation.logement.titre}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <FaHome />
                    </div>
                  )}
                </div>

                <div className="reservation-property-info">
                  <h2>{reservation.logement.titre}</h2>
                  <p className="reservation-property-location">
                    <FaMapMarkerAlt />
                    {reservation.logement.adresse
                      ? `${reservation.logement.adresse.ville}, ${reservation.logement.adresse.codePostal}`
                      : "Adresse non disponible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="reservation-info-grid">
              <div className="reservation-info-column">
                <div className="reservation-detail-section">
                  <h3 className="section-title">Détails du séjour</h3>
                  <div className="reservation-info-item">
                    <div className="info-icon-wrapper">
                      <FaCalendarAlt className="info-icon" />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Arrivée</span>
                      <span className="info-value">
                        {formatDate(reservation.dateDebut)}
                      </span>
                    </div>
                  </div>

                  <div className="reservation-info-item">
                    <div className="info-icon-wrapper">
                      <FaCalendarAlt className="info-icon" />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Départ</span>
                      <span className="info-value">
                        {formatDate(reservation.dateFin)}
                      </span>
                    </div>
                  </div>

                  <div className="reservation-info-item">
                    <div className="info-icon-wrapper">
                      <FaUsers className="info-icon" />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Voyageurs</span>
                      <span className="info-value">
                        {reservation.nombrePersonnes}{" "}
                        {reservation.nombrePersonnes > 1
                          ? "personnes"
                          : "personne"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="reservation-detail-section">
                  <h3 className="section-title">Contact hôte</h3>
                  {reservation.logement && reservation.logement.proprietaire ? (
                    <div className="host-info">
                      <div className="host-avatar">
                        <FaUser />
                      </div>
                      <div className="host-details">
                        <p className="host-name">
                          {reservation.logement.proprietaire.nom || ""}{" "}
                          {reservation.logement.proprietaire.prenom || ""}
                        </p>
                        {(reservation.statut === "confirmée" ||
                          reservation.statut === "terminée") && (
                          <>
                            {reservation.logement.proprietaire.email && (
                              <p className="host-contact">
                                <FaEnvelope className="host-icon" />
                                {reservation.logement.proprietaire.email}
                              </p>
                            )}
                            {reservation.logement.proprietaire.tel && (
                              <p className="host-contact">
                                <FaPhone className="host-icon" />
                                {reservation.logement.proprietaire.tel}
                              </p>
                            )}
                          </>
                        )}
                        {(reservation.statut === "en attente" ||
                          reservation.statut === "annulée") && (
                          <p className="host-pending-notice">
                            <FaInfoCircle className="host-icon" />
                            Les coordonnées seront disponibles après
                            confirmation
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="host-info text-muted">
                      <FaInfoCircle className="host-icon" />
                      Les informations de l'hôte seront disponibles après
                      confirmation.
                    </div>
                  )}
                </div>

                {reservation.messageDemande && (
                  <div className="reservation-detail-section">
                    <h3 className="section-title">Votre message</h3>
                    <div className="reservation-message">
                      <p>{reservation.messageDemande}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="reservation-info-column">
                <div className="reservation-detail-section reservation-summary-box">
                  <h3 className="section-title">Récapitulatif</h3>
                  <div className="reservation-summary">
                    <div className="summary-item">
                      <span>Prix par nuit</span>
                      <span>
                        {(reservation.prixTotal / nombreNuits).toFixed(2)} €
                      </span>
                    </div>
                    <div className="summary-item">
                      <span>× {nombreNuits} nuits</span>
                      <span>{reservation.prixTotal.toFixed(2)} €</span>
                    </div>
                    <div className="summary-item">
                      <span>Voyageurs</span>
                      <span>{reservation.nombrePersonnes}</span>
                    </div>
                    <div className="summary-total">
                      <span>Total</span>
                      <span>{reservation.prixTotal.toFixed(2)} €</span>
                    </div>

                    <div className="payment-info-box">
                      <FaCreditCard className="payment-icon" />
                      <p>
                        Paiement traité uniquement après confirmation de la
                        réservation
                      </p>
                    </div>

                    {reservation.statut === "en attente" && (
                      <button
                        onClick={handleCancelReservation}
                        disabled={cancelling}
                        className="cancel-reservation-btn"
                      >
                        {cancelling
                          ? "Annulation en cours..."
                          : "Annuler la réservation"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="reservation-detail-section">
                  <h3 className="section-title">Suivi de réservation</h3>
                  <div className="reservation-timeline">
                    <div className="timeline-item completed">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Réservation créée</h4>
                        <p>{formatDate(reservation.createdAt)}</p>
                      </div>
                    </div>

                    <div
                      className={`timeline-item ${
                        reservation.statut !== "en attente" ? "completed" : ""
                      }`}
                    >
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Confirmation</h4>
                        <p>
                          {reservation.statut !== "en attente"
                            ? reservation.updatedAt
                              ? formatDate(reservation.updatedAt)
                              : "Date non disponible"
                            : "En attente"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`timeline-item ${
                        reservation.statut === "confirmée" &&
                        new Date() >= new Date(reservation.dateDebut)
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Arrivée</h4>
                        <p>{formatDate(reservation.dateDebut)}</p>
                      </div>
                    </div>

                    <div
                      className={`timeline-item ${
                        reservation.statut === "terminée" ? "completed" : ""
                      }`}
                    >
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Départ</h4>
                        <p>{formatDate(reservation.dateFin)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationDetail;
