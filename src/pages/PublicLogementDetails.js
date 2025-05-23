import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { logementService } from "../services/LogementService";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBed,
  FaRulerCombined,
  FaBath,
  FaHome,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaCalendarAlt,
  FaInfoCircle,
  FaShare,
  FaUser,
} from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import NavbarHome from "../components/NavbarHome.js";
import "../styles/detailsAllLogement.css";
import AvisSection from "../components/Avis/AvisSection.js";

const PublicLogementDetails = () => {
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const renderSafely = (value, fallback = "") => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "object") {
      try {
        if (Array.isArray(value)) {
          return value
            .map((item) =>
              typeof item === "object" ? JSON.stringify(item) : item
            )
            .join(", ");
        }
        return JSON.stringify(value);
      } catch (err) {
        console.error("Erreur de rendu:", value);
        return fallback;
      }
    }
    return value.toString();
  };

  useEffect(() => {
    const fetchLogementDetails = async () => {
      try {
        setLoading(true);
        const data = await logementService.getLogementById(id);
        console.log("Données du logement :", data);

        if (!data || typeof data !== "object") {
          throw new Error("Données de logement invalides");
        }

        setLogement(data);
        setSelectedPhoto(
          data.photoprincipale || (data.photos && data.photos[0])
        );
        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement :", err);
        setError(
          `Impossible de charger les détails du logement : ${err.message}`
        );
        setLoading(false);
      }
    };

    fetchLogementDetails();
  }, [id]);

  const handleReservation = () => {
    if (!user) {
      setModalTitle("Connexion requise");
      setModalMessage(
        "Vous devez créer un compte ou vous connecter pour réserver ce logement."
      );
      setModalAction(() => () => navigate("/login"));
      setShowModal(true);
      return;
    }

    if (user && user.role !== "client") {
      setModalTitle("Accès réservé");
      setModalMessage(
        "Cette fonctionnalité est réservée aux clients. Votre compte actuel ne vous permet pas d'effectuer des réservations."
      );
      setModalAction(null);
      setShowModal(true);
      return;
    }

    if (user && user.role === "client") {
      navigate(`/reservationForm/${id}`);
    }
  };

  const handleTemporaryPhotoDisplay = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleShare = () => {
    // Implémentation du partage
    navigator.clipboard.writeText(window.location.href);
    alert("Lien copié dans le presse-papier!");
  };

  const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http") || path.startsWith("data:")) return path;
    if (path.startsWith("/api/")) return path;

    if (path.includes("uploads/")) {
      const parts = path.split("uploads/");
      return `/api/uploads/${parts[parts.length - 1]}`;
    }

    return `/api/uploads/${path}`;
  };

  const handleCloseModal = () => setShowModal(false);

  if (loading)
    return (
      <div className="ldp-loading">
        <div className="ldp-spinner"></div>
        <p>Chargement des informations...</p>
      </div>
    );

  if (error)
    return (
      <div className="ldp-error">
        <FaInfoCircle size={48} />
        <h3>Une erreur est survenue</h3>
        <p>{error}</p>
        <button className="ldp-btn" onClick={() => navigate("/")}>
          Retour à l'accueil
        </button>
      </div>
    );

  if (!logement)
    return (
      <div className="ldp-error">
        <FaInfoCircle size={48} />
        <h3>Logement non trouvé</h3>
        <p>Nous n'avons pas pu trouver le logement demandé.</p>
        <button className="ldp-btn" onClick={() => navigate("/")}>
          Retour à l'accueil
        </button>
      </div>
    );

  return (
    <>
      <NavbarHome />
      <div className="ldp-container">
        {/* Barre de navigation de la page */}
        <div className="ldp-nav">
          <button className="ldp-back-btn" onClick={() => navigate("/")}>
            <FaArrowLeft /> Retour à la recherche
          </button>
          <div className="ldp-actions">
            <button className="ldp-action-btn" onClick={handleShare}>
              <FaShare /> Partager
            </button>
          </div>
        </div>

        {/* Titre du logement */}
        <h1 className="ldp-title">{renderSafely(logement.titre)}</h1>
        <div className="ldp-subtitle">
          <FaMapMarkerAlt />
          <span>
            {renderSafely(logement.adresse?.ville)},{" "}
            {renderSafely(logement.adresse?.pays)}
          </span>
        </div>

        {/* Galerie photos */}
        <div className="ldp-gallery">
          <div className="ldp-main-image">
            <img
              src={getImageUrl(selectedPhoto || logement.photoprincipale)}
              alt={logement.titre}
            />
            {logement.disponible && (
              <div className="ldp-availability-badge ldp-available">
                <FaCheckCircle /> Disponible
              </div>
            )}
            {!logement.disponible && (
              <div className="ldp-availability-badge ldp-unavailable">
                Non disponible
              </div>
            )}
          </div>
          <div className="ldp-thumbnails">
            {logement.photos &&
              logement.photos.slice(0, 5).map((photo, index) => (
                <div
                  key={`thumbnail-${index}`}
                  className={`ldp-thumbnail ${
                    selectedPhoto === photo ? "ldp-selected" : ""
                  }`}
                  onClick={() => handleTemporaryPhotoDisplay(photo)}
                >
                  <img
                    src={getImageUrl(photo)}
                    alt={`Vue ${index + 1} du logement`}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="ldp-content">
          <div className="ldp-main-info">
            {/* Informations principales */}
            <div className="ldp-info-header">
              <h2>
                {logement.categorie && typeof logement.categorie === "object"
                  ? logement.categorie.nom
                  : "Logement"}{" "}
                à {renderSafely(logement.adresse?.ville)}
              </h2>
              <div className="ldp-info-stats">
                <span>
                  {renderSafely(logement.nombreChambres, "0")} chambres
                </span>
                <span>•</span>
                <span>
                  {renderSafely(logement.nombreSallesDeBain, "0")} salles de
                  bain
                </span>
                <span>•</span>
                <span>{renderSafely(logement.superficie, "0")} m²</span>
              </div>
            </div>

            {/* Description */}
            <div className="ldp-section">
              <h3 className="ldp-section-title">À propos de ce logement</h3>
              <p className="ldp-description">
                {renderSafely(
                  logement.description,
                  "Aucune description disponible pour ce logement."
                )}
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="ldp-section">
              <h3 className="ldp-section-title">Ce que propose ce logement</h3>
              <div className="ldp-features">
                <div className="ldp-feature">
                  <div className="ldp-feature-icon">
                    <FaBed />
                  </div>
                  <div className="ldp-feature-content">
                    <strong>Chambres</strong>
                    <span>{renderSafely(logement.nombreChambres, "0")}</span>
                  </div>
                </div>
                <div className="ldp-feature">
                  <div className="ldp-feature-icon">
                    <FaBath />
                  </div>
                  <div className="ldp-feature-content">
                    <strong>Salles de bain</strong>
                    <span>
                      {renderSafely(logement.nombreSallesDeBain, "0")}
                    </span>
                  </div>
                </div>
                <div className="ldp-feature">
                  <div className="ldp-feature-icon">
                    <FaRulerCombined />
                  </div>
                  <div className="ldp-feature-content">
                    <strong>Superficie</strong>
                    <span>{renderSafely(logement.superficie, "0")} m²</span>
                  </div>
                </div>
                <div className="ldp-feature">
                  <div className="ldp-feature-icon">
                    <FaHome />
                  </div>
                  <div className="ldp-feature-content">
                    <strong>Type</strong>
                    <span>
                      {logement.categorie &&
                      typeof logement.categorie === "object"
                        ? logement.categorie.nom
                        : "Non spécifié"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aménités */}
            {logement.amenites && logement.amenites.length > 0 && (
              <div className="ldp-section">
                <h3 className="ldp-section-title">Équipements</h3>
                <div className="ldp-amenities">
                  {logement.amenites.map((amenite, index) => (
                    <div key={`amenity-${index}`} className="ldp-amenity">
                      <FaCheckCircle />
                      <span>{renderSafely(amenite)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Avis - AJOUTEZ CE BLOC */}
            <div className="ldp-section">
              <h3 className="ldp-section-title">Commentaires</h3>
              <AvisSection logementId={id} />
            </div>
            {/* Emplacement */}
            <div className="ldp-section">
              <h3 className="ldp-section-title">Emplacement</h3>
              <div className="ldp-location">
                <div className="ldp-map-placeholder">
                  <FaMapMarkerAlt size={32} />
                  <p>
                    {renderSafely(logement.adresse?.rue)}{" "}
                    {renderSafely(logement.adresse?.codePostal)}{" "}
                    {renderSafely(logement.adresse?.ville)},{" "}
                    {renderSafely(logement.adresse?.pays)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau de réservation */}
          <div className="ldp-booking-panel">
            <div className="ldp-booking-card">
              <div className="ldp-price">
                <span className="ldp-price-value">
                  {renderSafely(logement.prix, "0")} €
                </span>
                <span className="ldp-price-period">/ nuit</span>
              </div>

              <div className="ldp-booking-info">
                <div className="ldp-host-info">
                  <div className="ldp-host-avatar">
                    <FaUser />
                  </div>
                  <div className="ldp-host-details">
                    <span>Propriétaire</span>
                    <strong>Propriétaire vérifié</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReservation}
                className="ldp-booking-btn"
                disabled={!logement.disponible}
              >
                {logement.disponible ? (
                  <>
                    <FaCalendarAlt /> Réserver
                  </>
                ) : (
                  "Non disponible"
                )}
              </button>

              <p className="ldp-booking-note">
                Vous ne serez pas débité immédiatement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaInfoCircle className="me-2" />
            {modalTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fermer
          </Button>
          {modalAction && (
            <Button
              variant="primary"
              onClick={() => {
                handleCloseModal();
                modalAction();
              }}
            >
              Se connecter
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PublicLogementDetails;
