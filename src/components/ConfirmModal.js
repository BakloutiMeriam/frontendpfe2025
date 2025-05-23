import React from "react";
import PropTypes from "prop-types";
import "../styles/reservationPourProp.css";

const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  reservation,
  conflictingReservations,
  formatDate,
}) => {
  if (!show || !reservation) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Confirmation de réservation</h2>
          <button className="close-modal-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="warning-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>
              <strong>Attention :</strong> En acceptant cette réservation,
              {conflictingReservations.length === 1
                ? " 1 autre demande de réservation"
                : ` ${conflictingReservations.length} autres demandes de réservation`}
              pour ce logement pendant ces dates sera{" "}
              {conflictingReservations.length === 1
                ? "automatiquement annulée"
                : "automatiquement annulées"}
              .
            </p>
          </div>

          <h3>Détails de la réservation à confirmer :</h3>
          <div className="reservation-details-modal">
            <p>
              <strong>Logement :</strong> {reservation.logement.titre}
            </p>
            <p>
              <strong>Client :</strong> {reservation.client.prenom}{" "}
              {reservation.client.nom}
            </p>
            <p>
              <strong>Période :</strong> Du {formatDate(reservation.dateDebut)}{" "}
              au {formatDate(reservation.dateFin)}
            </p>
            <p>
              <strong>Nombre de personnes :</strong>{" "}
              {reservation.nombrePersonnes}
            </p>
            <p>
              <strong>Montant total :</strong>{" "}
              {reservation.prixTotal.toFixed(2)} €
            </p>
          </div>

          <h3>Demandes qui seront annulées :</h3>
          <div className="conflicting-reservations">
            {conflictingReservations.map((res) => (
              <div key={res._id} className="conflict-item">
                <p>
                  <strong>Client :</strong> {res.client.prenom} {res.client.nom}
                </p>
                <p>
                  <strong>Période :</strong> Du {formatDate(res.dateDebut)} au{" "}
                  {formatDate(res.dateFin)}
                </p>
                <p>
                  <strong>Montant :</strong> {res.prixTotal.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirmer et annuler les autres demandes
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  reservation: PropTypes.object,
  conflictingReservations: PropTypes.array.isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default ConfirmModal;
