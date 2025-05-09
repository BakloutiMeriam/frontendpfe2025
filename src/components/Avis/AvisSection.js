/*import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaEdit,
  FaTrashAlt,
  FaCamera,
} from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/AvisSection.css";
import { updateAvis, deleteAvis } from "../../services/avisService";

const AvisSection = ({ logementId }) => {
  const [avisData, setAvisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAvis, setCurrentAvis] = useState(null);
  const [editFormData, setEditFormData] = useState({
    note: 5,
    commentaire: "",
    photos: [],
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAvis();
  }, [logementId]);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Chargement des avis pour le logement ${logementId}...`);

      const config = {
        withCredentials: true, // Important pour envoyer les cookies de session
      };

      const response = await axios.get(
        `/api/avis/logement/${logementId}`,
        config
      );

      console.log("Données d'avis reçues:", response.data);
      setAvisData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des avis:", err);
      setError("Impossible de charger les avis pour ce logement.");
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleShowEditModal = (avis) => {
    setCurrentAvis(avis);
    setEditFormData({
      note: avis.note,
      commentaire: avis.commentaire,
      photos: avis.photos || [],
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    console.log("Fermeture de la modale d'édition");
    setShowEditModal(false);
    setNewPhotos([]);
    setSuccessMessage("");
    setCurrentAvis(null); // Réinitialiser l'avis en cours d'édition
  };

  const handleShowDeleteModal = (avis) => {
    setCurrentAvis(avis);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSuccessMessage("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos([...newPhotos, ...files]);
  };

  const removeNewPhoto = (index) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index) => {
    setEditFormData({
      ...editFormData,
      photos: editFormData.photos.filter((_, i) => i !== index),
    });
  };

  const handleStarClick = (rating) => {
    setEditFormData({
      ...editFormData,
      note: rating,
    });
  };

  const handleUpdateAvis = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("note", editFormData.note);
      formData.append("commentaire", editFormData.commentaire);

      // Gérer les photos existantes correctement
      if (editFormData.photos && editFormData.photos.length > 0) {
        formData.append("existingPhotos", JSON.stringify(editFormData.photos));
      } else {
        formData.append("existingPhotos", JSON.stringify([]));
      }

      // Ajouter les nouvelles photos avec le même nom de champ
      if (newPhotos.length > 0) {
        newPhotos.forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      // Afficher le contenu du FormData pour debug
      console.log("FormData envoyé:");
      for (let pair of formData.entries()) {
        console.log(
          `${pair[0]}: ${
            typeof pair[1] === "object" ? "File: " + pair[1].name : pair[1]
          }`
        );
      }

      const response = await updateAvis(currentAvis._id, formData);

      // Vérifier la réponse
      if (!response || !response._id) {
        throw new Error("La réponse du serveur est invalide");
      }

      console.log("Avis mis à jour avec succès:", response);
      setSuccessMessage("Votre avis a été mis à jour avec succès!");

      // Mettre à jour manuellement l'avis dans l'état local pour éviter d'avoir à recharger
      if (avisData && avisData.avis) {
        const updatedAvis = avisData.avis.map((avis) =>
          avis._id === response._id ? response : avis
        );

        setAvisData({
          ...avisData,
          avis: updatedAvis,
          // Recalculer la note moyenne si nécessaire
          noteMoyenne:
            updatedAvis.reduce((sum, avis) => sum + avis.note, 0) /
            updatedAvis.length,
        });
      }

      // Fermer la modale et recharger les données après un délai
      setTimeout(() => {
        handleCloseEditModal();
        fetchAvis(); // Rechargez les avis depuis le serveur
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.response?.data?.message || "Échec de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteAvis = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await deleteAvis(currentAvis._id);

      setSuccessMessage("Votre avis a été supprimé avec succès!");
      setTimeout(() => {
        handleCloseDeleteModal();
        fetchAvis();
      }, 1500);
    } catch (err) {
      // Gestion des erreurs
    } finally {
      setSubmitting(false);
    }
  };
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

  // Fonction pour rendre les étoiles cliquables pour l'édition
  const renderClickableStars = () => {
    return (
      <div className="editable-stars">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span
            key={rating}
            onClick={() => handleStarClick(rating)}
            className="editable-star"
          >
            {rating <= editFormData.note ? (
              <FaStar className="star-icon active" />
            ) : (
              <FaRegStar className="star-icon" />
            )}
          </span>
        ))}
      </div>
    );
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

  // Fonction améliorée pour gérer l'affichage sécurisé des images utilisateur
  const getUserImageSrc = (user) => {
    if (!user) return "/default-avatar.png";

    // Priorité à url_img qui vient du backend
    if (user.url_img) {
      // Si c'est une URL externe (Google, Facebook, etc.)
      if (
        user.url_img.startsWith("http://") ||
        user.url_img.startsWith("https://")
      ) {
        return user.url_img;
      }
      // Si url_img contient déjà le chemin complet
      if (user.url_img.startsWith("/")) {
        return user.url_img;
      }
      // Sinon ajouter le préfixe API
      return `/api/uploads/${user.url_img}`;
    }

    // Seconde option: photo
    if (user.photo) {
      // Si c'est une URL externe (Google, Facebook, etc.)
      if (
        user.photo.startsWith &&
        (user.photo.startsWith("http://") || user.photo.startsWith("https://"))
      ) {
        return user.photo;
      }
      // Si c'est une data URL (base64)
      if (user.photo.startsWith && user.photo.startsWith("data:")) {
        return user.photo;
      }
      // Si c'est une URL locale complète
      if (user.photo.startsWith && user.photo.startsWith("/")) {
        return user.photo;
      }
      // Sinon c'est juste un nom de fichier
      return `/uploads/${user.photo}`;
    }

    // Aucune image trouvée
    return "/default-avatar.png";
  };

  // Fonction pour gérer l'affichage des photos d'avis
  const getAvisPhotoSrc = (photo) => {
    if (!photo) return null;

    // Si c'est une URL complète
    if (photo.startsWith("/")) {
      return photo;
    }

    // Si le chemin inclut déjà "/uploads/"
    if (photo.includes("/uploads/")) {
      return `/api${photo}`; // Ajouter préfixe API
    }

    // Sinon, c'est probablement juste un nom de fichier
    return `/uploads/${photo}`;
  };

  // Vérifie si l'utilisateur est l'auteur de l'avis
  const isAvisOwner = (avis) => {
    if (!user || !avis.clientId) return false;

    // Si clientId est un objet avec _id
    if (typeof avis.clientId === "object" && avis.clientId._id) {
      return user._id === avis.clientId._id;
    }

    // Si clientId est une chaîne de caractères
    if (typeof avis.clientId === "string") {
      return user._id === avis.clientId;
    }

    return false;
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

      <div className="avis-preview">
        {avisData.avis.slice(0, 2).map((avis, index) => (
          <div key={index} className="avis-preview-item">
            <div className="avis-preview-header">
              <div className="avis-preview-user">
                <img
                  src={getUserImageSrc(avis.clientId)}
                  alt={`${avis.clientId?.prenom || "Utilisateur"}`}
                  className="avis-user-avatar"
                />
                <div className="avis-user-info">
                  <div className="avis-user-name">
                    {avis.clientId?.prenom || "Anonyme"}
                  </div>
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

            {isAvisOwner(avis) && (
              <div className="avis-actions">
                <button
                  className="avis-action-btn edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowEditModal(avis);
                  }}
                >
                  <FaEdit /> Modifier
                </button>
                <button
                  className="avis-action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDeleteModal(avis);
                  }}
                >
                  <FaTrashAlt /> Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {avisData.totalAvis > 2 && (
        <button onClick={handleShowModal} className="avis-show-all">
          Afficher tous les {avisData.totalAvis} commentaires
        </button>
      )}

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
                        src={getUserImageSrc(avis.clientId)}
                        alt={`${avis.clientId?.prenom || "Utilisateur"}`}
                        className="avis-user-avatar"
                      />
                      <div className="avis-user-info">
                        <div className="avis-user-name">
                          {avis.clientId?.prenom || "Anonyme"}
                        </div>
                        <div className="avis-date">
                          {formatDate(avis.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="avis-rating">{renderStars(avis.note)}</div>
                  </div>
                  <div className="avis-comment">{avis.commentaire}</div>

                  {avis.photos && avis.photos.length > 0 && (
                    <div className="avis-photos">
                      {avis.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={getAvisPhotoSrc(photo)}
                          alt={`img de l'avis ${photoIndex + 1}`}
                          className="avis-photo"
                        />
                      ))}
                    </div>
                  )}

                  {isAvisOwner(avis) && (
                    <div className="avis-actions modal-actions">
                      <button
                        className="avis-action-btn edit"
                        onClick={() => {
                          handleCloseModal();
                          handleShowEditModal(avis);
                        }}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="avis-action-btn delete"
                        onClick={() => {
                          handleCloseModal();
                          handleShowDeleteModal(avis);
                        }}
                      >
                        <FaTrashAlt /> Supprimer
                      </button>
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

      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        className="avis-edit-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier votre avis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage ? (
            <div className="avis-success-message">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
            </div>
          ) : (
            <Form onSubmit={handleUpdateAvis}>
              {error && <div className="alert alert-danger">{error}</div>}

              <Form.Group className="mb-4">
                <Form.Label>Votre note</Form.Label>
                <div className="rating-selection">
                  {renderClickableStars()}
                  <span className="selected-rating">{editFormData.note}/5</span>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Votre commentaire</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="commentaire"
                  value={editFormData.commentaire}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Photos actuelles</Form.Label>
                {editFormData.photos && editFormData.photos.length > 0 ? (
                  <div className="existing-photos">
                    {editFormData.photos.map((photo, index) => (
                      <div key={index} className="photo-container">
                        <img
                          src={getAvisPhotoSrc(photo)}
                          alt={`img ${index + 1}`}
                          className="photo-preview"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => removeExistingPhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Aucune photo</p>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Ajouter des photos</Form.Label>
                <div className="upload-photos-container">
                  <div
                    className="upload-btn-wrapper"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      display: "inline-block",
                    }}
                  >
                    <Button variant="outline-secondary" className="upload-btn">
                      <FaCamera /> Choisir des photos
                    </Button>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        opacity: 0,
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        zIndex: 2,
                      }}
                    />
                  </div>
                  <small className="text-muted">
                    Formats acceptés: JPG, PNG. Max 5MB par image.
                  </small>
                </div>

                {newPhotos.length > 0 && (
                  <div className="new-photos-preview">
                    {newPhotos.map((photo, index) => (
                      <div key={index} className="photo-container">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Nouvelle img ${index + 1}`}
                          className="photo-preview"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => removeNewPhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseEditModal}
                  className="me-2"
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        className="avis-delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage ? (
            <div className="avis-success-message">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
            </div>
          ) : (
            <>
              {error && <div className="alert alert-danger">{error}</div>}
              <p>Êtes-vous sûr de vouloir supprimer cet avis ?</p>
              <p className="text-danger mb-0">
                <strong>Attention:</strong> Cette action est irréversible.
              </p>
            </>
          )}
        </Modal.Body>
        {!successMessage && (
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseDeleteModal}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAvis}
              disabled={submitting}
            >
              {submitting ? "Suppression..." : "Supprimer"}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default AvisSection;*/
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaEdit,
  FaTrashAlt,
  FaCamera,
} from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/AvisSection.css";
import { updateAvis, deleteAvis } from "../../services/avisService";

const AvisSection = ({ logementId }) => {
  const [avisData, setAvisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAvis, setCurrentAvis] = useState(null);
  const [editFormData, setEditFormData] = useState({
    note: 5,
    commentaire: "",
    photos: [],
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAvis();
  }, [logementId]);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Chargement des avis pour le logement ${logementId}...`);

      const config = {
        withCredentials: true, // Important pour envoyer les cookies de session
      };

      const response = await axios.get(
        `/api/avis/logement/${logementId}`,
        config
      );

      console.log("Données d'avis reçues:", response.data);
      setAvisData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des avis:", err);
      setError("Impossible de charger les avis pour ce logement.");
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleShowEditModal = (avis) => {
    setCurrentAvis(avis);
    setEditFormData({
      note: avis.note,
      commentaire: avis.commentaire,
      photos: avis.photos || [],
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    console.log("Fermeture de la modale d'édition");
    setShowEditModal(false);
    setNewPhotos([]);
    setSuccessMessage("");
    setCurrentAvis(null); // Réinitialiser l'avis en cours d'édition
  };

  const handleShowDeleteModal = (avis) => {
    setCurrentAvis(avis);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSuccessMessage("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos([...newPhotos, ...files]);
  };

  const removeNewPhoto = (index) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index) => {
    setEditFormData({
      ...editFormData,
      photos: editFormData.photos.filter((_, i) => i !== index),
    });
  };

  const handleStarClick = (rating) => {
    setEditFormData({
      ...editFormData,
      note: rating,
    });
  };

  const handleUpdateAvis = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("note", editFormData.note);
      formData.append("commentaire", editFormData.commentaire);

      // Renommer existingPhotos en photosToKeep pour correspondre à l'attente du backend
      if (editFormData.photos && editFormData.photos.length > 0) {
        formData.append("photosToKeep", JSON.stringify(editFormData.photos));
      } else {
        formData.append("photosToKeep", JSON.stringify([]));
      }

      // Ajouter les nouvelles photos avec le même nom de champ
      if (newPhotos.length > 0) {
        newPhotos.forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      // Afficher le contenu du FormData pour debug
      console.log("FormData envoyé:");
      for (let pair of formData.entries()) {
        console.log(
          `${pair[0]}: ${
            typeof pair[1] === "object" ? "File: " + pair[1].name : pair[1]
          }`
        );
      }

      const response = await updateAvis(currentAvis._id, formData);

      // Vérifier la réponse
      if (!response || !response._id) {
        throw new Error("La réponse du serveur est invalide");
      }

      console.log("Avis mis à jour avec succès:", response);
      setSuccessMessage("Votre avis a été mis à jour avec succès!");

      // Mettre à jour manuellement l'avis dans l'état local pour éviter d'avoir à recharger
      if (avisData && avisData.avis) {
        const updatedAvis = avisData.avis.map((avis) =>
          avis._id === response._id ? response : avis
        );

        setAvisData({
          ...avisData,
          avis: updatedAvis,
          // Recalculer la note moyenne si nécessaire
          noteMoyenne:
            updatedAvis.reduce((sum, avis) => sum + avis.note, 0) /
            updatedAvis.length,
        });
      }

      // Fermer la modale et recharger les données après un délai
      setTimeout(() => {
        handleCloseEditModal();
        fetchAvis(); // Rechargez les avis depuis le serveur
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.response?.data?.message || "Échec de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAvis = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await deleteAvis(currentAvis._id);

      setSuccessMessage("Votre avis a été supprimé avec succès!");
      setTimeout(() => {
        handleCloseDeleteModal();
        fetchAvis();
      }, 1500);
    } catch (err) {
      // Gestion des erreurs
    } finally {
      setSubmitting(false);
    }
  };
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

  // Fonction pour rendre les étoiles cliquables pour l'édition
  const renderClickableStars = () => {
    return (
      <div className="editable-stars">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span
            key={rating}
            onClick={() => handleStarClick(rating)}
            className="editable-star"
          >
            {rating <= editFormData.note ? (
              <FaStar className="star-icon active" />
            ) : (
              <FaRegStar className="star-icon" />
            )}
          </span>
        ))}
      </div>
    );
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

  // Fonction améliorée pour gérer l'affichage sécurisé des images utilisateur
  const getUserImageSrc = (user) => {
    if (!user) return "/default-avatar.png";

    // Priorité à url_img qui vient du backend
    if (user.url_img) {
      // Si c'est une URL externe (Google, Facebook, etc.)
      if (
        user.url_img.startsWith("http://") ||
        user.url_img.startsWith("https://")
      ) {
        return user.url_img;
      }
      // Si url_img contient déjà le chemin complet
      if (user.url_img.startsWith("/")) {
        return user.url_img;
      }
      // Sinon ajouter le préfixe API
      return `/api/uploads/${user.url_img}`;
    }

    // Seconde option: photo
    if (user.photo) {
      // Si c'est une URL externe (Google, Facebook, etc.)
      if (
        user.photo.startsWith &&
        (user.photo.startsWith("http://") || user.photo.startsWith("https://"))
      ) {
        return user.photo;
      }
      // Si c'est une data URL (base64)
      if (user.photo.startsWith && user.photo.startsWith("data:")) {
        return user.photo;
      }
      // Si c'est une URL locale complète
      if (user.photo.startsWith && user.photo.startsWith("/")) {
        return user.photo;
      }
      // Sinon c'est juste un nom de fichier
      return `/uploads/${user.photo}`;
    }

    // Aucune image trouvée
    return "/default-avatar.png";
  };

  // Fonction pour gérer l'affichage des photos d'avis
  const getAvisPhotoSrc = (photo) => {
    if (!photo) return null;

    // Si c'est une URL complète
    if (photo.startsWith("/")) {
      return photo;
    }

    // Si le chemin inclut déjà "/uploads/"
    if (photo.includes("/uploads/")) {
      return `/api${photo}`; // Ajouter préfixe API
    }

    // Sinon, c'est probablement juste un nom de fichier
    return `/uploads/${photo}`;
  };

  // Vérifie si l'utilisateur est l'auteur de l'avis
  const isAvisOwner = (avis) => {
    if (!user || !avis.clientId) return false;

    // Si clientId est un objet avec _id
    if (typeof avis.clientId === "object" && avis.clientId._id) {
      return user._id === avis.clientId._id;
    }

    // Si clientId est une chaîne de caractères
    if (typeof avis.clientId === "string") {
      return user._id === avis.clientId;
    }

    return false;
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

      <div className="avis-preview">
        {avisData.avis.slice(0, 2).map((avis, index) => (
          <div key={index} className="avis-preview-item">
            <div className="avis-preview-header">
              <div className="avis-preview-user">
                <img
                  src={getUserImageSrc(avis.clientId)}
                  alt={`${avis.clientId?.prenom || "Utilisateur"}`}
                  className="avis-user-avatar"
                />
                <div className="avis-user-info">
                  <div className="avis-user-name">
                    {avis.clientId?.prenom || "Anonyme"}
                  </div>
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

            {/* Boutons de modification et suppression - version preview */}
            {isAvisOwner(avis) && (
              <div className="avis-actions">
                <button
                  className="avis-action-btn edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowEditModal(avis);
                  }}
                >
                  <FaEdit /> Modifier
                </button>
                <button
                  className="avis-action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDeleteModal(avis);
                  }}
                >
                  <FaTrashAlt /> Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

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
                        src={getUserImageSrc(avis.clientId)}
                        alt={`${avis.clientId?.prenom || "Utilisateur"}`}
                        className="avis-user-avatar"
                      />
                      <div className="avis-user-info">
                        <div className="avis-user-name">
                          {avis.clientId?.prenom || "Anonyme"}
                        </div>
                        <div className="avis-date">
                          {formatDate(avis.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="avis-rating">{renderStars(avis.note)}</div>
                  </div>
                  <div className="avis-comment">{avis.commentaire}</div>

                  {avis.photos && avis.photos.length > 0 && (
                    <div className="avis-photos">
                      {avis.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={getAvisPhotoSrc(photo)}
                          alt={`img de l'avis ${photoIndex + 1}`}
                          className="avis-photo"
                        />
                      ))}
                    </div>
                  )}

                  {/* Boutons de modification et suppression - version modale */}
                  {isAvisOwner(avis) && (
                    <div className="avis-actions modal-actions">
                      <button
                        className="avis-action-btn edit"
                        onClick={() => {
                          handleCloseModal();
                          handleShowEditModal(avis);
                        }}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="avis-action-btn delete"
                        onClick={() => {
                          handleCloseModal();
                          handleShowDeleteModal(avis);
                        }}
                      >
                        <FaTrashAlt /> Supprimer
                      </button>
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

      {/* Modal pour modifier un avis */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        className="avis-edit-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier votre avis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage ? (
            <div className="avis-success-message">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
            </div>
          ) : (
            <Form onSubmit={handleUpdateAvis}>
              {error && <div className="alert alert-danger">{error}</div>}

              <Form.Group className="mb-4">
                <Form.Label>Votre note</Form.Label>
                <div className="rating-selection">
                  {renderClickableStars()}
                  <span className="selected-rating">{editFormData.note}/5</span>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Votre commentaire</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="commentaire"
                  value={editFormData.commentaire}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Photos actuelles</Form.Label>
                {editFormData.photos && editFormData.photos.length > 0 ? (
                  <div className="existing-photos">
                    {editFormData.photos.map((photo, index) => (
                      <div key={index} className="photo-container">
                        <img
                          src={getAvisPhotoSrc(photo)}
                          alt={`img ${index + 1}`}
                          className="photo-preview"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => removeExistingPhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Aucune photo</p>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Ajouter des photos</Form.Label>
                <div className="upload-photos-container">
                  <div
                    className="upload-btn-wrapper"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      display: "inline-block",
                    }}
                  >
                    <Button variant="outline-secondary" className="upload-btn">
                      <FaCamera /> Choisir des photos
                    </Button>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        opacity: 0,
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        zIndex: 2,
                      }}
                    />
                  </div>
                  <small className="text-muted">
                    Formats acceptés: JPG, PNG. Max 5MB par image.
                  </small>
                </div>

                {newPhotos.length > 0 && (
                  <div className="new-photos-preview">
                    {newPhotos.map((photo, index) => (
                      <div key={index} className="photo-container">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Nouvelle img ${index + 1}`}
                          className="photo-preview"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => removeNewPhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseEditModal}
                  className="me-2"
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal pour confirmer la suppression */}
      <Modal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        className="avis-delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage ? (
            <div className="avis-success-message">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
            </div>
          ) : (
            <>
              {error && <div className="alert alert-danger">{error}</div>}
              <p>Êtes-vous sûr de vouloir supprimer cet avis ?</p>
              <p className="text-danger mb-0">
                <strong>Attention:</strong> Cette action est irréversible.
              </p>
            </>
          )}
        </Modal.Body>
        {!successMessage && (
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseDeleteModal}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAvis}
              disabled={submitting}
            >
              {submitting ? "Suppression..." : "Supprimer"}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default AvisSection;
