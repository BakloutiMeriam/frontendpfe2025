import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const CompleteProfile = () => {
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
        adresse: userData.adresse || "",
        role: userData.role || "",
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Compléter votre profil</h2>
        {errors.general && (
          <p className="text-danger text-center">{errors.general}</p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="form-control mb-3"
          />
          <div className="text-center mb-3">
            <img
              src={photo}
              alt="Profil"
              className="img-thumbnail"
              width="100"
              height="100"
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="nom"
              value={formData.nom}
              disabled
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="prenom"
              value={formData.prenom}
              disabled
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              disabled
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="tel"
              value={formData.tel}
              onChange={handleInputChange}
              placeholder="Téléphone"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              placeholder="Adresse"
              required
            />
          </div>
          <div className="mb-3">
            <select
              className="form-control"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="client">Client</option>
              <option value="proprietaire">Propriétaire</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
