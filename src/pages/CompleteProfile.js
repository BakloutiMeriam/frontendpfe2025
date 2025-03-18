import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../styles/complete-profile.css";
import Navbar from "../components/Navbar";

const CompleteProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, token, updateUserAfterProfileCompletion } =
    useContext(AuthContext);

  const [formData, setFormData] = useState({
    tel: "",
    adresse: "",
    role: "client", // Valeur par défaut
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState({
    nom: "",
    prenom: "",
    email: "",
    url_img: "user.png",
  });

  // Chargement des données initiales de l'utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      // Priorité 1: Utiliser l'utilisateur du contexte d'authentification
      if (user) {
        setUserInfo({
          nom: user.nom || "",
          prenom: user.prenom || "",
          email: user.email || "",
          url_img: user.url_img || "user.png",
        });

        setFormData({
          tel: user.tel && user.tel !== 0 ? user.tel : "",
          adresse:
            user.adresse && user.adresse !== "adresse" ? user.adresse : "",
          role: user.role || "client",
        });
        return;
      }

      // Priorité 2: Si pas d'utilisateur dans le contexte, essayer de récupérer via l'userId
      if (userId) {
        try {
          // Tenter de récupérer les données utilisateur depuis le serveur
          const apiUrl = `${
            process.env.REACT_APP_API_URL || "http://localhost:3000"
          }/api/user/get-user/${userId}`;
          const response = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            const userData = response.data.user;
            setUserInfo({
              nom: userData.nom || "",
              prenom: userData.prenom || "",
              email: userData.email || "",
              url_img: userData.url_img || "user.png",
            });

            setFormData({
              tel: userData.tel && userData.tel !== 0 ? userData.tel : "",
              adresse:
                userData.adresse && userData.adresse !== "adresse"
                  ? userData.adresse
                  : "",
              role: userData.role || "client",
            });
          }
        } catch (err) {
          console.error(
            "Erreur lors de la récupération des données utilisateur:",
            err
          );
          setError(
            "Impossible de récupérer vos informations. Veuillez vous reconnecter."
          );
        }
      } else {
        // Si ni user ni userId n'est disponible, rediriger vers la page de connexion
        navigate("/login", { replace: true });
      }
    };

    loadUserData();
  }, [user, userId, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};

    // Validation du numéro de téléphone (8 chiffres)
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(formData.tel)) {
      errors.tel = "Le numéro de téléphone doit contenir 8 chiffres.";
    }

    // Validation de l'adresse (non vide)
    if (!formData.adresse.trim()) {
      errors.adresse = "L'adresse est obligatoire.";
    }

    // Validation du rôle (doit être 'client' ou 'proprietaire')
    if (!["client", "proprietaire"].includes(formData.role)) {
      errors.role = "Veuillez sélectionner un rôle valide.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Valider le formulaire
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      setLoading(false);
      return;
    }

    try {
      // Déterminer l'ID utilisateur à utiliser
      const actualUserId = userId || user?._id;

      if (!actualUserId) {
        throw new Error(
          "ID utilisateur non disponible. Veuillez vous reconnecter."
        );
      }

      // Préparer les données à envoyer
      const dataToSend = {
        userId: actualUserId,
        tel: formData.tel,
        adresse: formData.adresse,
        role: formData.role,
      };

      console.log("Envoi des données:", dataToSend);

      // Envoyer la requête au serveur
      const apiUrl = `${
        process.env.REACT_APP_API_URL || "http://localhost:3000"
      }/api/user/complete-profile`;
      const response = await axios.post(apiUrl, dataToSend, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Réponse du serveur:", response.data);

      if (response.data.success) {
        // Mettre à jour le contexte d'authentification avec les nouvelles données
        updateUserAfterProfileCompletion(
          response.data.user,
          response.data.token
        );

        // Afficher un message de succès temporaire et rediriger
        alert("Votre profil a été complété avec succès!");

        // Rediriger en fonction du rôle
        if (response.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/profile", { replace: true });
        }
      } else {
        setError(
          response.data.message ||
            "La mise à jour a échoué pour une raison inconnue."
        );
      }
    } catch (err) {
      console.error("Erreur lors de la complétion du profil:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors de la mise à jour du profil."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="complete-profile-container">
        <div className="complete-profile-card">
          <h2>Compléter votre profil</h2>

          <div className="user-info-header">
            {userInfo.url_img && userInfo.url_img !== "user.png" ? (
              <img
                src={userInfo.url_img}
                alt="profileImg"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                <i className="bi bi-person"></i>
              </div>
            )}
            <div className="user-details">
              <h3>
                {userInfo.prenom} {userInfo.nom}
              </h3>
              <p>{userInfo.email}</p>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tel">Numéro de téléphone*</label>
              <input
                type="tel"
                id="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className="form-control"
                required
                placeholder="Entrez votre numéro de téléphone"
              />
              <small className="form-text text-muted">
                Votre numéro doit contenir 8 chiffres.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse*</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="form-control"
                required
                placeholder="Entrez votre adresse complète"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rôle*</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="client">Client</option>
                <option value="proprietaire">Propriétaire</option>
              </select>
              <small className="form-text text-muted">
                Choisissez "Client" si vous cherchez à louer ou "Propriétaire"
                si vous souhaitez mettre des propriétés en location.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>{" "}
                  Chargement...
                </span>
              ) : (
                "Compléter mon profil"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;
