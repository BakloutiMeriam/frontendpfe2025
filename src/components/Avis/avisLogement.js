import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaUser,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "../../styles/AvisLogement.css";

const AvisLogement = ({ logementId, onLaisserAvis }) => {
  const [avis, setAvis] = useState([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [totalAvis, setTotalAvis] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Nombre d'avis à afficher par défaut
  const avisPerPage = 3;

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/avis/logement/${logementId}`);
        setAvis(response.data.avis);
        setNoteMoyenne(response.data.noteMoyenne);
        setTotalAvis(response.data.totalAvis);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger les avis");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAvis();
  }, [logementId]);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Rendu des étoiles basé sur la note
  const renderStars = (note) => {
    const stars = [];
    const fullStars = Math.floor(note);
    const hasHalfStar = note - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }

    return stars;
  };

  // Répartition des notes
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 étoiles

    avis.forEach((review) => {
      if (review.note >= 1 && review.note <= 5) {
        distribution[5 - Math.round(review.note)]++;
      }
    });

    return distribution;
  };

  // Calcul des pourcentages pour la barre de progression
  const calculatePercentage = (count) => {
    return totalAvis > 0 ? (count / totalAvis) * 100 : 0;
  };

  // Toggles
  const toggleExpanded = () => setExpanded(!expanded);
  const toggleShowAll = () => setShowAll(!showAll);

  // Gestion des photos
  const openImageModal = (url) => {
    setSelectedImage(url);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const displayedAvis = showAll ? avis : avis.slice(0, avisPerPage);
  const distribution = getRatingDistribution();

  if (loading) {
    return (
      <div className="avis-loading text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des avis...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="avis-logement-container">
      <div className="avis-logement-header">
        <h2 className="avis-section-title">
          Évaluations et commentaires
          <span className="avis-count">({totalAvis})</span>
        </h2>

        <button
          className="btn btn-primary laisser-avis-btn"
          onClick={onLaisserAvis}
        >
          Laisser un avis
        </button>
      </div>

      {totalAvis > 0 ? (
        <>
          <div className="note-globale-section">
            <div className="note-globale-display">
              <div className="note-value">{noteMoyenne.toFixed(1)}</div>
              <div className="stars-display">{renderStars(noteMoyenne)}</div>
              <div className="total-avis">
                {totalAvis} {totalAvis > 1 ? "avis" : "avis"}
              </div>
            </div>

            <div className={`ratings-breakdown ${expanded ? "expanded" : ""}`}>
              <button className="expand-btn" onClick={toggleExpanded}>
                {expanded ? "Masquer le détail" : "Voir le détail des notes"}
                {expanded ? (
                  <FaChevronUp className="ms-2" />
                ) : (
                  <FaChevronDown className="ms-2" />
                )}
              </button>

              {expanded && (
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map((stars, index) => (
                    <div key={stars} className="rating-bar-item">
                      <div className="rating-label">{stars} étoiles</div>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${calculatePercentage(
                              distribution[index]
                            )}%`,
                          }}
                          aria-valuenow={calculatePercentage(
                            distribution[index]
                          )}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <div className="rating-count">{distribution[index]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="avis-list">
            {displayedAvis.map((review) => (
              <div key={review._id} className="avis-item">
                <div className="avis-header">
                  <div className="user-info">
                    {review.clientId.photo ? (
                      <img
                        src={`/uploads/${review.clientId.photo}`}
                        alt={`${review.clientId.prenom}`}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <FaUser />
                      </div>
                    )}
                    <div className="user-details">
                      <div className="user-name">
                        {review.clientId.prenom}{" "}
                        {review.clientId.nom?.charAt(0) || ""}
                      </div>
                      <div className="review-date">
                        <FaCalendarAlt className="me-1" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="user-rating">{renderStars(review.note)}</div>
                </div>

                <div className="avis-content">
                  <p>{review.commentaire}</p>
                </div>

                {review.photos && review.photos.length > 0 && (
                  <div className="avis-photos">
                    {review.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="avis-photo-item"
                        onClick={() => openImageModal(`/uploads/${photo}`)}
                      >
                        <img
                          src={`/uploads/${photo}`}
                          alt={`img ${index + 1} de l'avis`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {avis.length > avisPerPage && (
            <div className="show-more-container">
              <button
                className="btn btn-outline-secondary show-more-btn"
                onClick={toggleShowAll}
              >
                {showAll ? (
                  <>
                    Afficher moins
                    <FaChevronUp className="ms-2" />
                  </>
                ) : (
                  <>
                    Afficher tous les avis ({totalAvis})
                    <FaChevronDown className="ms-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-avis">
          <p>Aucun avis pour ce logement pour le moment.</p>
          <p>Soyez le premier à partager votre expérience !</p>
        </div>
      )}

      {/* Modal pour afficher l'image en grand */}
      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeImageModal}>
              &times;
            </span>
            <img src={selectedImage} alt="Vue agrandie" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AvisLogement;
