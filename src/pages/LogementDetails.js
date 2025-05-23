import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { logementService } from "../services/LogementService";
import Layout from "../components/Layout";
import "../styles/details.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBed,
  FaRulerCombined,
  FaBath,
  FaHome,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaStar,
} from "react-icons/fa";

const LogementDetails = () => {
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLogement, setEditedLogement] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

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
        const data = await logementService.getLogementById(id);
        console.log("Données du logement :", data);
        console.log("Catégorie du logement :", data.categorie);

        if (!data || typeof data !== "object") {
          throw new Error("Données de logement invalides");
        }

        setLogement(data);
        setEditedLogement({ ...data });
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

    const fetchCategories = async () => {
      try {
        const categoriesData = await logementService.getCategories();
        console.log("Catégories disponibles:", categoriesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Erreur de chargement des catégories :", err);
      }
    };

    fetchLogementDetails();
    fetchCategories();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce logement ?")) {
      try {
        await logementService.deleteLogement(id);
        navigate("/mes-logements");
      } catch (err) {
        console.error("Erreur de suppression :", err);
        setError(`Impossible de supprimer le logement : ${err.message}`);
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Retour à l'édition - garder la photo originale
      setSelectedPhoto(
        logement.photoprincipale || (logement.photos && logement.photos[0])
      );
    } else {
      // Annulation de l'édition
      setSelectedPhoto(
        logement.photoprincipale || (logement.photos && logement.photos[0])
      );
      setNewPhotos([]); // Réinitialiser les nouvelles photos lors de l'annulation
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "categorie") {
      // Gérer spécifiquement le changement de catégorie
      setEditedLogement((prev) => ({
        ...prev,
        categorie: value, // Stocker directement l'ID comme une chaîne
      }));
      return;
    }
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedLogement((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditedLogement((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImageFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024 // Limite à 5 Mo
    );

    if (validImageFiles.length !== files.length) {
      alert(
        "Certains fichiers ont été ignorés (taille > 5 Mo ou type invalide)"
      );
    }

    const imagePromises = validImageFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then((base64Images) => {
        setNewPhotos((prev) => [...prev, ...base64Images]);

        if (!selectedPhoto) {
          setSelectedPhoto(base64Images[0]);
        }
      })
      .catch((error) => {
        console.error("Erreur de chargement des images :", error);
        setError("Impossible de charger les images");
      });
  };

  const handleRemovePhoto = (photoToRemove) => {
    // Filtrer les photos existantes
    const updatedExistingPhotos = (editedLogement.photos || []).filter(
      (photo) => photo !== photoToRemove
    );

    // Filtrer les nouvelles photos
    const updatedNewPhotos = newPhotos.filter(
      (photo) => photo !== photoToRemove
    );

    // Mettre à jour l'état
    setEditedLogement((prev) => ({
      ...prev,
      photos: updatedExistingPhotos,
    }));
    setNewPhotos(updatedNewPhotos);

    // Gérer la photo sélectionnée
    if (photoToRemove === selectedPhoto) {
      const remainingPhotos = [...updatedExistingPhotos, ...updatedNewPhotos];
      setSelectedPhoto(remainingPhotos.length > 0 ? remainingPhotos[0] : null);
    }
  };

  // Nouvelle fonction pour définir une photo comme principale
  const handleSetMainPhoto = (photo) => {
    setSelectedPhoto(photo);
    setEditedLogement((prev) => ({
      ...prev,
      photoprincipale: photo,
    }));
  };

  // Fonction pour afficher temporairement une photo comme principale sans la définir comme photoprincipale
  const handleTemporaryPhotoDisplay = (photo) => {
    setSelectedPhoto(photo);
  };

  const getImageUrl = (path) => {
    if (!path) return "";

    // Si le chemin est déjà un URL complet ou une image base64, retourner tel quel
    if (path.startsWith("http") || path.startsWith("data:")) return path;

    // Si le chemin commence par /api/, retourner tel quel
    if (path.startsWith("/api/")) return path;

    // Pour éviter la double préfixation
    if (path.includes("uploads/")) {
      const parts = path.split("uploads/");
      return `/api/uploads/${parts[parts.length - 1]}`;
    }

    // Sinon, ajouter le préfixe
    return `/api/uploads/${path}`;
  };

  const handleAmenityChange = (index, value) => {
    const newAmenites = [...editedLogement.amenites];
    newAmenites[index] = value;
    setEditedLogement((prev) => ({
      ...prev,
      amenites: newAmenites,
    }));
  };

  const handleAddAmenity = () => {
    setEditedLogement((prev) => ({
      ...prev,
      amenites: [...(prev.amenites || []), ""],
    }));
  };

  const handleRemoveAmenity = (index) => {
    const newAmenites = editedLogement.amenites.filter((_, i) => i !== index);
    setEditedLogement((prev) => ({
      ...prev,
      amenites: newAmenites,
    }));
  };

  const handleSave = async () => {
    try {
      const logementToUpdate = {
        ...editedLogement,
        photos: [
          ...(editedLogement.photos || []).filter(
            (photo) => !newPhotos.includes(photo)
          ),
          ...newPhotos,
        ],
        photoprincipale: editedLogement.photoprincipale,
        categorie: editedLogement.categorie?.id || editedLogement.categorie,
      };

      const updatedLogement = await logementService.updateLogement(
        id,
        logementToUpdate
      );

      setLogement(updatedLogement);
      setEditedLogement(updatedLogement);
      setSelectedPhoto(
        updatedLogement.photoprincipale || updatedLogement.photos[0]
      );
      setNewPhotos([]);
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      setError(`Impossible de mettre à jour le logement : ${err.message}`);
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!logement)
    return <div className="text-center mt-5">Logement non trouvé</div>;

  return (
    <Layout>
      <div className="logement-details-container">
        <div className="property-header">
          <div>
            {isEditing ? (
              <input
                type="text"
                name="titre"
                value={editedLogement.titre}
                onChange={handleInputChange}
                className="form-control mb-2"
              />
            ) : (
              <h1 className="property-title-prop">
                {renderSafely(logement.titre)}
              </h1>
            )}
            <div className="property-subtitle">
              <FaMapMarkerAlt />
              {isEditing ? (
                <div className="d-flex">
                  <input
                    type="text"
                    name="adresse.ville"
                    value={editedLogement.adresse.ville}
                    onChange={handleInputChange}
                    className="form-control me-2"
                    placeholder="Ville"
                  />
                  <input
                    type="text"
                    name="adresse.pays"
                    value={editedLogement.adresse.pays}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Pays"
                  />
                </div>
              ) : (
                `${renderSafely(logement.adresse.ville)}, ${renderSafely(
                  logement.adresse.pays
                )}`
              )}
            </div>
          </div>
          <div className="d-flex">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn btn-success me-2">
                  <FaSave /> Enregistrer
                </button>
                <button
                  onClick={handleEditToggle}
                  className="btn btn-secondary me-2"
                >
                  <FaTimes /> Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditToggle}
                  className="btn btn-outline-primary me-2"
                >
                  <FaEdit /> Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-outline-danger"
                >
                  <FaTrash /> Supprimer
                </button>
              </>
            )}
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary ms-2"
            >
              Retour
            </button>
          </div>
        </div>

        <div className="property-image-section">
          <img
            src={getImageUrl(selectedPhoto || logement.photoprincipale)}
            alt="Ph principale"
            className="main-image"
          />

          {isEditing ? (
            <div className="image-edit-section">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="form-control mb-3"
              />

              <div className="thumbnail-gallery">
                {/* Photos existantes et nouvelles photos combinées */}
                {[...(editedLogement.photos || []), ...newPhotos].map(
                  (photo, index) => (
                    <div
                      key={`photo-${index}`}
                      className={`thumbnail-item ${
                        selectedPhoto === photo ? "thumbnail-selected" : ""
                      }`}
                    >
                      <div className="thumbnail-image-container">
                        <img
                          src={
                            photo.startsWith("data:")
                              ? photo
                              : getImageUrl(photo)
                          }
                          alt={`Miniature ${index + 1}`}
                          onClick={() => handleTemporaryPhotoDisplay(photo)}
                          className="thumbnail-image"
                        />

                        {/* Badge pour la photo principale */}
                        {editedLogement.photoprincipale === photo && (
                          <span className="thumbnail-badge">Principale</span>
                        )}
                      </div>

                      <div className="thumbnail-actions">
                        <button
                          onClick={() => handleSetMainPhoto(photo)}
                          className={`btn-thumbnail ${
                            editedLogement.photoprincipale === photo
                              ? "btn-thumbnail-active"
                              : ""
                          }`}
                          title="Définir comme photo principale"
                        >
                          <FaStar />
                        </button>

                        <button
                          onClick={() => handleRemovePhoto(photo)}
                          className="btn-thumbnail btn-thumbnail-danger"
                          title="Supprimer cette photo"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="thumbnail-gallery-view">
              {logement.photos &&
                logement.photos.map((photo, index) => (
                  <div
                    key={`view-photo-${index}`}
                    className={`thumbnail-item-view ${
                      selectedPhoto === photo ? "thumbnail-selected" : ""
                    } ${
                      logement.photoprincipale === photo ? "thumbnail-main" : ""
                    }`}
                  >
                    <img
                      src={getImageUrl(photo)}
                      alt={`Miniature ${index + 1}`}
                      onClick={() => handleTemporaryPhotoDisplay(photo)}
                      className="thumbnail-image-view"
                    />
                    {logement.photoprincipale === photo && (
                      <span className="thumbnail-badge-view">
                        <FaStar />
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="property-details">
          <div className="property-info">
            <h2>Détails du logement</h2>
            <div className="property-characteristics">
              {[
                {
                  icon: <FaBed />,
                  label: "Chambres",
                  field: "nombreChambres",
                  type: "number",
                },
                {
                  icon: <FaBath />,
                  label: "Salles de bain",
                  field: "nombreSallesDeBain",
                  type: "number",
                },
                {
                  icon: <FaRulerCombined />,
                  label: "Superficie",
                  field: "superficie",
                  type: "number",
                  suffix: " m²",
                },
                {
                  icon: <FaHome />,
                  label: "Catégorie",
                  field: "categorie",
                  type: "select",
                },
              ].map((characteristic) => (
                <div key={characteristic.label} className="characteristic">
                  <div className="characteristic-icon">
                    {characteristic.icon}
                  </div>
                  <strong>{characteristic.label}</strong>
                  {isEditing ? (
                    characteristic.type === "select" ? (
                      <select
                        name="categorie"
                        value={
                          typeof editedLogement.categorie === "object"
                            ? editedLogement.categorie.id ||
                              editedLogement.categorie._id
                            : editedLogement.categorie
                        }
                        onChange={handleInputChange}
                        className="form-control"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nom}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={characteristic.type}
                        name={characteristic.field}
                        value={editedLogement[characteristic.field]}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    )
                  ) : (
                    <p>
                      {renderSafely(
                        characteristic.type === "select"
                          ? typeof logement.categorie === "object"
                            ? logement.categorie.nom || "Nom manquant"
                            : (() => {
                                console.log(
                                  "Recherche catégorie:",
                                  logement.categorie,
                                  "dans",
                                  categories
                                );
                                // Essayer avec id et _id pour couvrir les deux cas
                                const foundCat = categories.find(
                                  (cat) =>
                                    String(cat.id) ===
                                      String(logement.categorie) ||
                                    String(cat._id) ===
                                      String(logement.categorie)
                                );
                                return foundCat?.nom || "Catégorie inconnue";
                              })()
                          : logement[characteristic.field],
                        "0"
                      )}
                      {characteristic.suffix || ""}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3>Description</h3>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedLogement.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                />
              ) : (
                <p>{renderSafely(logement.description)}</p>
              )}
            </div>
          </div>

          <div className="price-section">
            <h3>Prix</h3>
            {isEditing ? (
              <input
                type="number"
                name="prix"
                value={editedLogement.prix}
                onChange={handleInputChange}
                className="form-control"
              />
            ) : (
              <div className="price-highlight">
                {renderSafely(logement.prix, "0")} € / nuit
              </div>
            )}
            <div className="mt-3">
              {isEditing ? (
                <select
                  name="disponible"
                  value={editedLogement.disponible}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value={true}>Disponible</option>
                  <option value={false}>Non disponible</option>
                </select>
              ) : (
                <span
                  className={`badge ${
                    logement.disponible ? "bg-success" : "bg-danger"
                  }`}
                >
                  {logement.disponible ? "Disponible" : "Non disponible"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="amenities-section">
          <h2>Aménités</h2>
          <div className="amenities-grid">
            {(isEditing ? editedLogement.amenites : logement.amenites)?.map(
              (amenite, index) => (
                <div
                  key={`amenity-${index}`}
                  className="amenity-item d-flex align-items-center"
                >
                  <FaCheckCircle />
                  {isEditing ? (
                    <div className="d-flex w-100">
                      <input
                        type="text"
                        value={amenite}
                        onChange={(e) =>
                          handleAmenityChange(index, e.target.value)
                        }
                        className="form-control mx-2"
                      />
                      <button
                        onClick={() => handleRemoveAmenity(index)}
                        className="btn btn-danger btn-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <span>{renderSafely(amenite)}</span>
                  )}
                </div>
              )
            )}
            {isEditing && (
              <button
                onClick={handleAddAmenity}
                className="btn btn-outline-primary mt-2"
              >
                Ajouter une aménité
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LogementDetails;
