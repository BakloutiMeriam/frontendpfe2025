import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/complete-profile.css"; // Importez le fichier CSS
import Navbar from "../components/Navbar";

const CompleteProfileGoogle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = useSelector((state) => state.auth.user);
  console.log("Utilisateur connecté :", storedUser);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    adresse: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState("user.png"); // Image par défaut

  useEffect(() => {
    console.log("Données reçues via location.state :", location.state);
    let userData = location.state?.user || storedUser;

    if (!userData) {
      const storedUserData = localStorage.getItem("user");
      if (storedUserData) {
        userData = JSON.parse(storedUserData);
      }
    }

    if (userData) {
      setFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
        tel: userData.tel || "",
        adresse:
          userData.adresse === "Non renseignée" ? "" : userData.adresse || "", // Corrige la valeur par défaut
        role: userData.role === "role" ? "" : userData.role || "", // Corrige la valeur par défaut
      });

      setPhoto(userData.url_img || "user.png");
    } else {
      navigate("/login");
    }
  }, [location.state, storedUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /*const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };*/

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tel, adresse, role } = formData;

    if (!tel || !adresse || !role) {
      setErrors({ general: "Tous les champs doivent être remplis." });
      return;
    }

    try {
      const userData = location.state?.user || storedUser;
      if (!userData) throw new Error("Utilisateur introuvable.");

      console.log("Envoi des données au serveur :", {
        ...formData,
        userId: userData._id,
        url_img: photo !== "user.png" ? photo : undefined,
      });

      const payload = {
        ...formData,
        userId: userData._id,
        url_img: photo !== "user.png" ? photo : undefined,
      };

      if (!token) {
        console.error("Token manquant !");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/user/complete-profile",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const data = await response.json();
      console.log("Profil mis à jour avec succès", data);
    } catch (error) {
      console.error("Erreur lors de la soumission du profil", error);
      setErrors({ general: error.message });
    }
  };

  return (
    <>
      <Navbar />
      <div className="complete-profile-container">
        <div className="complete-profile-card">
          <h2 className="complete-profile-title">Compléter votre profil</h2>

          {/* Affichage du message d'erreur */}
          {errors.general && <p className="error-message">{errors.general}</p>}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="complete-profile-form">
            {/* Téléchargement de la photo */}
            {/*<input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="form-control mb-3"
            />*/}

            {/* Image de profil */}
            <div className="text-center mb-3">
              <img src={photo} alt="Profil" className="profile-image" />
            </div>

            {/* Nom */}
            <div className="form-group">
              <input
                type="text"
                name="nom"
                value={formData.nom}
                disabled
                placeholder="Nom"
              />
            </div>

            {/* Prénom */}
            <div className="form-group">
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                disabled
                placeholder="Prénom"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="Email"
              />
            </div>

            {/* Téléphone */}
            <div className="form-group">
              <input
                type="text"
                name="tel"
                value={formData.tel}
                onChange={handleInputChange}
                placeholder="Téléphone"
                required
              />
            </div>

            {/* Adresse */}
            <div className="form-group">
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                placeholder="Adresse"
                required
              />
            </div>

            {/* Rôle */}
            <div className="form-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="" selected>
                  Choisir votre rôle
                </option>
                <option value="client">Client</option>
                <option value="proprietaire">Propriétaire</option>
              </select>
            </div>
            {/* Bouton de soumission */}
            <button type="submit">Enregistrer</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompleteProfileGoogle;
