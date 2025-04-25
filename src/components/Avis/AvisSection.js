import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "../../styles/AvisSection.css";

const AvisSection = ({ logementId }) => {
  const [avisData, setAvisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/avis/logement/${logementId}`);
        setAvisData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des avis:", err);
        setError("Impossible de charger les avis pour ce logement.");
        setLoading(false);
      }
    };

    fetchAvis();
  }, [logementId]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Fonction pour afficher les étoiles de notation
  const renderStars = (note) => {
    const stars = [];
    const fullStars = Math.floor(note);
    const hasHalfStar = note % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star-icon" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star-icon" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-icon" />);
      }
    }

    return stars;
  };

  // Pour calculer le pourcentage des notes
  const calculatePercentage = (count, total) => {
    if (!total) return 0;
    return (count / total) * 100;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  if (loading)
    return <div className="avis-loading">Chargement des avis...</div>;
  if (error) return <div className="avis-error">{error}</div>;
  if (!avisData) return null;

  // Préparation des données pour l'affichage des statistiques
  const noteCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  // Compter les avis par note
  avisData.avis.forEach((avis) => {
    const noteArrondie = Math.round(avis.note);
    if (noteArrondie >= 1 && noteArrondie <= 5) {
      noteCounts[noteArrondie]++;
    }
  });

  return (
    <div className="avis-section">
      {/* Résumé des avis avec note moyenne et nombre d'avis */}
      <div className="avis-summary" onClick={handleShowModal}>
        <div className="avis-rating">
          <div className="avis-stars">{renderStars(avisData.noteMoyenne)}</div>
          <div className="avis-score">{avisData.noteMoyenne.toFixed(1)}</div>
        </div>
        <div className="avis-count">
          {avisData.totalAvis}{" "}
          {avisData.totalAvis > 1 ? "commentaires" : "commentaire"}
        </div>
      </div>

      {/* Aperçu des avis récents (afficher 2 maximum) */}
      <div className="avis-preview">
        {avisData.avis.slice(0, 2).map((avis, index) => (
          <div key={index} className="avis-preview-item">
            <div className="avis-preview-header">
              <div className="avis-preview-user">
                <img
                  src={
                    avis.clientId.photo
                      ? `/api/uploads/${avis.clientId.photo}`
                      : "/default-avatar.png"
                  }
                  alt={`${avis.clientId.prenom}`}
                  className="avis-user-avatar"
                />
                <div className="avis-user-info">
                  <div className="avis-user-name">{avis.clientId.prenom}</div>
                  <div className="avis-date">{formatDate(avis.createdAt)}</div>
                </div>
              </div>
              <div className="avis-preview-rating">
                {renderStars(avis.note)}
              </div>
            </div>
            <div className="avis-preview-comment">
              {avis.commentaire.length > 150
                ? `${avis.commentaire.substring(0, 150)}...`
                : avis.commentaire}
            </div>
          </div>
        ))}
      </div>

      {/* Lien pour afficher tous les avis */}
      {avisData.totalAvis > 2 && (
        <button onClick={handleShowModal} className="avis-show-all">
          Afficher tous les {avisData.totalAvis} commentaires
        </button>
      )}

      {/* Modal pour afficher tous les avis */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        className="avis-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="modal-rating-header">
              <div className="modal-stars">
                {renderStars(avisData.noteMoyenne)}
              </div>
              <div className="modal-score">
                {avisData.noteMoyenne.toFixed(1)} · {avisData.totalAvis}{" "}
                {avisData.totalAvis > 1 ? "commentaires" : "commentaire"}
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="avis-modal-content">
            <div className="avis-statistics">
              <h4>Évaluation globale</h4>
              <div className="avis-bars">
                {[5, 4, 3, 2, 1].map((note) => (
                  <div key={note} className="avis-bar-container">
                    <div className="avis-bar-label">{note}</div>
                    <div className="avis-bar-wrapper">
                      <div
                        className="avis-bar-fill"
                        style={{
                          width: `${calculatePercentage(
                            noteCounts[note],
                            avisData.totalAvis
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="avis-bar-percentage">
                      {Math.round(
                        calculatePercentage(
                          noteCounts[note],
                          avisData.totalAvis
                        )
                      )}
                      %
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="avis-list">
              {avisData.avis.map((avis, index) => (
                <div key={index} className="avis-item">
                  <div className="avis-header">
                    <div className="avis-user">
                      <img
                        src={
                          avis.clientId.url_img
                            ? `/api/uploads/${avis.clientId.url_img}`
                            : "/default-avatar.png"
                        }
                        alt={`${avis.clientId.prenom}`}
                        className="avis-user-avatar"
                      />
                      <div className="avis-user-info">
                        <div className="avis-user-name">
                          {avis.clientId.prenom}
                        </div>
                        <div className="avis-date">
                          {formatDate(avis.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="avis-rating">{renderStars(avis.note)}</div>
                  </div>
                  <div className="avis-comment">{avis.commentaire}</div>

                  {/* Photos des avis si disponibles */}
                  {avis.photos && avis.photos.length > 0 && (
                    <div className="avis-photos">
                      {avis.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={`/api/uploads/${photo.split("/uploads/")[1]}`}
                          alt={`img de l'avis ${photoIndex + 1}`}
                          className="avis-photo"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AvisSection;
