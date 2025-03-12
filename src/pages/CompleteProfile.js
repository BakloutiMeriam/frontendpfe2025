/*import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CompleteProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    adresse: "",
    role: "",
    url_img: "",
  });

  const [error, setError] = useState("");
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/user/facebook/user/${userId}`
        );
        const data = await response.json();

        if (data.success && data.userData) {
          setFormData((prevData) => ({
            ...prevData,
            ...data.userData,
          }));
        }
      } catch (error) {
        console.error("Erreur de chargement des données :", error);
      }
    };

    fetchUserData();
  }, [userId]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Met à jour dynamiquement le champ modifié
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(formData.tel)) {
      setError("Le numéro de téléphone doit contenir 8 chiffres.");
      return;
    }

    if (!formData.adresse.trim() || !formData.role) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/user/completer-profil/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.message) {
        //alert(data.message);
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la mise à jour du profil.");
    }
  };

  return (
    <div className="container">
      <h2>Compléter votre profil</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        {formData.url_img && (
          <img src={formData.url_img} alt="Profil" width="100" />
        )}

        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input
            type="text"
            className="form-control"
            name="nom"
            value={formData.nom}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Prénom</label>
          <input
            type="text"
            className="form-control"
            name="prenom"
            value={formData.prenom}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Numéro de téléphone</label>
          <input
            type="text"
            className="form-control"
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Adresse</label>
          <input
            type="text"
            className="form-control"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Rôle</label>
          <select
            className="form-select"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="client">Client</option>
            <option value="proprietaire">Propriétaire</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;*/
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/complete-profile.css"; // Importez le fichier CSS
import Navbar from "../components/Navbar";

const CompleteProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    adresse: "",
    role: "",
    url_img: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/user/facebook/user/${userId}`
        );
        const data = await response.json();

        if (data.success && data.userData) {
          setFormData((prevData) => ({
            ...prevData,
            ...data.userData,
          }));
        }
      } catch (error) {
        console.error("Erreur de chargement des données :", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(formData.tel)) {
      setError("Le numéro de téléphone doit contenir 8 chiffres.");
      return;
    }

    if (!formData.adresse.trim() || !formData.role) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/user/completer-profil/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.message) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la mise à jour du profil.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="complete-profile-container">
        <div className="complete-profile-card">
          <h2 className="complete-profile-title">Compléter votre profil</h2>

          {/* Affichage du message d'erreur */}
          {error && <p className="error-message">{error}</p>}

          {/* Image de profil */}
          {formData.url_img && (
            <img
              src={formData.url_img}
              alt="Profil"
              className="profile-image"
            />
          )}

          <form onSubmit={handleSubmit} className="complete-profile-form">
            {/* Nom */}
            <div className="form-group">
              <input type="text" name="nom" value={formData.nom} readOnly />
            </div>

            {/* Prénom */}
            <div className="form-group">
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                readOnly
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
              />
            </div>

            {/* Téléphone */}
            <div className="form-group">
              <input
                type="text"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                placeholder="Entrer votre N° de télèphone"
                required
              />
            </div>

            {/* Adresse */}
            <div className="form-group">
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Entrer votre adresse "
                required
              />
            </div>

            {/* Rôle */}
            <div className="form-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="" disabled selected>
                  Choisir votre rôle
                </option>
                <option value="client">Client</option>
                <option value="proprietaire">Propriétaire</option>
              </select>
            </div>

            {/* Bouton de soumission */}
            <button type="submit">Sauvegarder</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;
