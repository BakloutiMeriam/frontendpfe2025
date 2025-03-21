import React, { useEffect, useState, useContext } from "react";
import UserService from "../services/UserService";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  // État pour les champs modifiables
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    adresse: "",
    mdp: "",
    confirmMdp: "",
    url_img: null,
  });

  // État pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    mdp: "",
    confirmMdp: "",
  });

  useEffect(() => {
    console.log("Utilisateur dans le contexte (ViewProfile):", user);
    const fetchUserProfile = async () => {
      try {
        if (!user) {
          console.log("Pas d'utilisateur dans le contexte");
          setLoading(false);
          setError("Aucun utilisateur connecté");
          navigate("/login", { replace: true });
          return;
        }

        if (!user.role) {
          console.log("Pas de rôle défini pour l'utilisateur");
          navigate(`/completer-profil/${user._id}`, { replace: true });
          return;
        }

        // Vérifier la propriété approvalStatus pour les propriétaires
        if (
          user.role.toLowerCase() === "proprietaire" &&
          user.approvalStatus === "pending"
        ) {
          navigate("/confirmation", { replace: true });
          return;
        }

        let data;
        if (user.role === "client") {
          data = await UserService.getUserProfileClient();
        } else if (user.role === "proprietaire") {
          data = await UserService.getUserProfileProp();
        } else {
          throw new Error(`Rôle inconnu: ${user.role}`);
        }

        console.log("Données du profil reçues:", data);
        setProfile(data);
        setFormData({
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          tel: data.tel || "",
          adresse: data.adresse || "",
          mdp: "",
          confirmMdp: "",
          url_img: null,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, user]);

  // Validation des champs
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nom":
      case "prenom":
        if (!value.trim()) {
          error = `Le ${name === "nom" ? "nom" : "prénom"} est requis`;
        } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) {
          error = `Le ${
            name === "nom" ? "nom" : "prénom"
          } ne doit contenir que des lettres`;
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "L'email n'est pas valide";
        }
        break;

      case "tel":
        if (value && !/^\d{8}$/.test(value)) {
          error = "Le numéro de téléphone doit contenir 8 chiffres";
        }
        break;

      case "mdp":
        if (value && value.length < 6) {
          error = "Le mot de passe doit contenir au moins 6 caractères";
        }
        break;

      case "confirmMdp":
        if (value && value !== formData.mdp) {
          error = "Les mots de passe ne correspondent pas";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "url_img" && files && files[0]) {
      // Validation du type de fichier image
      const file = files[0];
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
      ];

      if (!validImageTypes.includes(file.type)) {
        setValidationErrors({
          ...validationErrors,
          url_img: "Format d'image non supporté. Utilisez JPEG, PNG ou GIF.",
        });
        return;
      }

      if (file.size > 5000000) {
        // 5MB
        setValidationErrors({
          ...validationErrors,
          url_img:
            "L'image est trop volumineuse. La taille maximale est de 5MB.",
        });
        return;
      }

      setFormData({ ...formData, [name]: file });
      setFileName(file.name);
      setValidationErrors({
        ...validationErrors,
        url_img: "",
      });
    } else {
      const error = validateField(name, value);

      setFormData({ ...formData, [name]: value });
      setValidationErrors({
        ...validationErrors,
        [name]: error,
      });
    }
  };

  const isFormValid = () => {
    // Vérifier d'abord les champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.email) {
      return false;
    }

    // Vérifier s'il y a des erreurs de validation
    for (const key in validationErrors) {
      if (validationErrors[key]) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation finale avant soumission
    const errors = {
      nom: validateField("nom", formData.nom),
      prenom: validateField("prenom", formData.prenom),
      email: validateField("email", formData.email),
      tel: validateField("tel", formData.tel),
      mdp: validateField("mdp", formData.mdp),
      confirmMdp: validateField("confirmMdp", formData.confirmMdp),
    };

    setValidationErrors(errors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      setError(
        "Veuillez corriger les erreurs avant de soumettre le formulaire."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Créer un FormData pour gérer l'upload d'image
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "url_img" && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== "url_img" && key !== "confirmMdp" && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Appel à l'API pour mettre à jour le profil
      await UserService.updateUserProfile(submitData);

      // Rafraîchir les données du profil
      let updatedProfile;
      if (user.role === "client") {
        updatedProfile = await UserService.getUserProfileClient();
      } else {
        updatedProfile = await UserService.getUserProfileProp();
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage("Profil mis à jour avec succès!");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await UserService.deleteUserProfile();
      setMessage("Profil désactivé avec succès!");
      // Déconnecter l'utilisateur après la suppression du profil
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la désactivation du profil:", err);
      setError(err.message || "Erreur lors de la désactivation du profil");
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Réinitialiser le formulaire aux valeurs actuelles du profil
    setFormData({
      nom: profile.nom || "",
      prenom: profile.prenom || "",
      email: profile.email || "",
      tel: profile.tel || "",
      adresse: profile.adresse || "",
      mdp: "",
      confirmMdp: "",
      url_img: null,
    });
    setFileName("");

    // Réinitialiser les erreurs de validation
    setValidationErrors({
      nom: "",
      prenom: "",
      email: "",
      tel: "",
      mdp: "",
      confirmMdp: "",
      url_img: "",
    });

    setError("");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isEditing ? (
        <>
          <div className="profile-header">
            <h2>Mon Profil</h2>
            <span className="profile-role">{profile.role}</span>
          </div>

          <div className="profile-image-container">
            <img
              src={
                profile.url_img || "https://via.placeholder.com/150?text=Photo"
              }
              alt="Profil"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=Photo";
              }}
            />
          </div>

          <div className="profile-content">
            <div className="text-center mb-4">
              <h3>Bienvenue, {profile.prenom}!</h3>
            </div>

            <div className="profile-info-card">
              <div className="info-group">
                <i className="fas fa-user"></i>
                <div className="info-label">Nom complet</div>
                <div className="info-value">
                  {profile.prenom} {profile.nom}
                </div>
              </div>

              <div className="info-group">
                <i className="fas fa-envelope"></i>
                <div className="info-label">Email</div>
                <div className="info-value">{profile.email}</div>
              </div>

              {profile.tel && (
                <div className="info-group">
                  <i className="fas fa-phone"></i>
                  <div className="info-label">Téléphone</div>
                  <div className="info-value">{profile.tel}</div>
                </div>
              )}

              {profile.adresse && (
                <div className="info-group">
                  <i className="fas fa-map-marker-alt"></i>
                  <div className="info-label">Adresse</div>
                  <div className="info-value">{profile.adresse}</div>
                </div>
              )}
            </div>

            <div className="registration-date">
              <i className="fas fa-calendar-alt me-2"></i>
              Membre depuis le{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit me-2"></i>
                Modifier le profil
              </button>

              <button
                className="btn btn-danger"
                onClick={() => setShowConfirmation(true)}
              >
                <i className="fas fa-trash-alt me-2"></i>
                Désactiver le compte
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="edit-profile-form">
          <h2>Modifier votre profil</h2>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="nom" className="form-label">
                    Nom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      validationErrors.nom ? "is-invalid" : ""
                    }`}
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.nom && (
                    <div className="invalid-feedback">
                      {validationErrors.nom}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="prenom" className="form-label">
                    Prénom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      validationErrors.prenom ? "is-invalid" : ""
                    }`}
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.prenom && (
                    <div className="invalid-feedback">
                      {validationErrors.prenom}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-group mt-3">
              <label htmlFor="email" className="form-label">
                Email<span className="required">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${
                  validationErrors.email ? "is-invalid" : ""
                }`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {validationErrors.email && (
                <div className="invalid-feedback">{validationErrors.email}</div>
              )}
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="tel" className="form-label">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      validationErrors.tel ? "is-invalid" : ""
                    }`}
                    id="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                  />
                  {validationErrors.tel && (
                    <div className="invalid-feedback">
                      {validationErrors.tel}
                    </div>
                  )}
                  <small className="text-muted">
                    Format: 8 chiffres, sans espaces ni caractères spéciaux
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="adresse" className="form-label">
                    Adresse
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="mdp" className="form-label">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      validationErrors.mdp ? "is-invalid" : ""
                    }`}
                    id="mdp"
                    name="mdp"
                    value={formData.mdp}
                    onChange={handleChange}
                  />
                  {validationErrors.mdp && (
                    <div className="invalid-feedback">
                      {validationErrors.mdp}
                    </div>
                  )}
                  <small className="text-muted">
                    Minimum 6 caractères. Laisser vide pour garder le mot de
                    passe actuel.
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="confirmMdp" className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      validationErrors.confirmMdp ? "is-invalid" : ""
                    }`}
                    id="confirmMdp"
                    name="confirmMdp"
                    value={formData.confirmMdp}
                    onChange={handleChange}
                    disabled={!formData.mdp}
                  />
                  {validationErrors.confirmMdp && (
                    <div className="invalid-feedback">
                      {validationErrors.confirmMdp}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Photo de profil</label>
              <div className="file-input-container">
                <label className="file-input-btn">
                  <i className="fas fa-upload me-2"></i>
                  {fileName ? fileName : "Choisir une image"}
                  <input
                    type="file"
                    className="file-input"
                    id="url_img"
                    name="url_img"
                    onChange={handleChange}
                    accept="image/jpeg, image/png, image/gif"
                  />
                </label>
              </div>
              {validationErrors.url_img && (
                <div className="error-text">{validationErrors.url_img}</div>
              )}
              <small className="text-muted d-block mt-2">
                Formats supportés: JPG, PNG, GIF. Taille max: 5Mo.
              </small>

              {profile.url_img && (
                <div className="current-image mt-3">
                  <p>Image actuelle</p>
                  <img
                    src={profile.url_img}
                    alt="Aperçu du profil actuel"
                    className="profile-image preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/100?text=Photo";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid() || loading}
              >
                {loading && <span className="spinner"></span>}
                <i className="fas fa-save me-2"></i>
                Enregistrer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {showConfirmation && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmer la désactivation</h3>
            </div>
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir désactiver votre compte? Cette action
                est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt me-2"></i>
                    Confirmer la désactivation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
