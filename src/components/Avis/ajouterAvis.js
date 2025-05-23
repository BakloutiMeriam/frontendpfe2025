import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { FaStar, FaComment } from "react-icons/fa";
import { BsUpload, BsTrash } from "react-icons/bs";
import "../../styles/AjouterAvis.css";

const AjouterAvisModal = ({ show, onHide, logementId, onSuccess }) => {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [photos, setPhotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [logementDetails, setLogementDetails] = useState(null);

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (show) {
      setNote(0);
      setCommentaire("");
      setPhotos([]);
      setPreviewImages([]);
      checkReviewEligibility();
    }
  }, [show, logementId]);

  // Vérifier si l'utilisateur peut laisser un avis
  const checkReviewEligibility = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Vous devez être connecté pour laisser un avis");
        onHide();
        return;
      }

      // Récupérer les détails du logement
      const logementRes = await axios.get(
        `/api/logement/details/${logementId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLogementDetails(logementRes.data);

      // Vérifier si l'utilisateur peut laisser un avis
      const res = await axios.get(`/api/avis/can-review/${logementId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Vérifier si l'utilisateur peut laisser un avis
      const canLeaveReview = res.data.canReview;

      // Si l'utilisateur ne peut pas laisser d'avis, afficher les toasts et fermer la modale
      if (!canLeaveReview) {
        toast.error("Vous ne pouvez pas laisser d'avis pour ce logement");

        // Toast spécifique selon la raison
        if (!res.data.hasStayed) {
          toast.info(
            "Vous devez avoir séjourné dans ce logement pour laisser un avis."
          );
        } else if (res.data.hasReviewed) {
          toast.info("Vous avez déjà laissé un avis pour ce logement.");
        } else if (!res.data.inTimeFrame) {
          toast.info(
            "Vous ne pouvez laisser un avis que dans les 30 jours suivant votre séjour."
          );
        } else if (!res.data.reservationStarted) {
          toast.info(
            "Vous ne pouvez laisser un avis que si votre période de réservation a déjà commencé."
          );
        }

        onHide();
        return;
      }

      // Si l'utilisateur peut laisser un avis, mettre à jour l'état
      setCanReview(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la vérification d'éligibilité:", error);
      toast.error("Erreur lors de la vérification d'éligibilité");
      onHide();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      toast.warning("Vous ne pouvez pas télécharger plus de 5 photos.");
      return;
    }

    // Créer des URL pour la prévisualisation
    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);

    // Préparer les fichiers pour l'envoi
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);

    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index]); // Libérer l'URL
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  const handleStarClick = (value) => {
    setNote(value);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (note === 0) {
      toast.warning("Veuillez attribuer une note");
      return;
    }

    if (commentaire.trim() === "") {
      toast.warning("Veuillez laisser un commentaire");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("logementId", logementId);
      formData.append("note", note);
      formData.append("commentaire", commentaire);

      // Ajouter chaque photo au FormData
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      // Envoyer tout en une seule requête
      await axios.post("/api/avis", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Votre avis a été publié avec succès!");

      if (onSuccess) {
        onSuccess();
      }

      onHide();
    } catch (error) {
      console.error("Erreur lors de la publication de l'avis:", error);
      toast.error(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la publication de votre avis"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      size="lg"
      className="avis-form-modal"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaComment className="avis-form-me-2" />
          {logementDetails
            ? `Laisser un avis pour ${logementDetails.titre}`
            : "Laisser un avis"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isLoading ? (
          <div className="avis-form-loading-container">
            <div className="avis-form-spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="avis-form-mt-2">Chargement en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Notation par étoiles */}
            <div className="avis-form-mb-4">
              <label className="avis-form-label">Votre note</label>
              <div className="avis-form-star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={30}
                    className="avis-form-me-1"
                    color={star <= note ? "#ffc107" : "#e4e5e9"}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="avis-form-mb-4">
              <label htmlFor="commentaire" className="avis-form-label">
                Votre commentaire
              </label>
              <textarea
                className="avis-form-control"
                id="commentaire"
                rows="5"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Partagez votre expérience..."
                required
              ></textarea>
            </div>

            {/* Upload de photos */}
            <div className="avis-form-mb-4">
              <label className="avis-form-label">
                Ajouter des photos (max 5)
              </label>
              <div className="avis-form-input-group avis-form-mb-3">
                <input
                  type="file"
                  className="avis-form-control"
                  id="photos"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={photos.length >= 5}
                />
                <label className="avis-form-input-group-text" htmlFor="photos">
                  <BsUpload />
                </label>
              </div>

              {/* Prévisualisation des photos */}
              {previewImages.length > 0 && (
                <div className="avis-form-d-flex avis-form-flex-wrap avis-form-mt-2">
                  {previewImages.map((src, index) => (
                    <div
                      className="avis-form-position-relative avis-form-me-2 avis-form-mb-2"
                      key={index}
                    >
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="avis-form-img-thumbnail"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="avis-form-btn-danger position-absolute top-0 end-0"
                        onClick={() => removePhoto(index)}
                      >
                        <BsTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <small className="avis-form-text-muted">
                {photos.length}/5 photos sélectionnées
              </small>
            </div>
          </form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          className="avis-form-btn avis-form-btn-secondary"
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || isLoading}
          className="avis-form-btn avis-form-btn-primary"
        >
          {loading ? (
            <>
              <span
                className="avis-form-spinner-border avis-form-me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Publication en cours...
            </>
          ) : (
            "Publier votre avis"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AjouterAvisModal;
