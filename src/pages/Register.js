import { useContext, useState, useEffect } from "react";
import { ProfileContext } from "../context/ProfileContext";
import ProfileForm from "../components/ProfileForm";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const { register, error } = useContext(ProfileContext);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleRegister = async (formData) => {
    setFormError("");
    console.log("🔹 FormData reçu :", formData);

    // Validation des champs
    if (
      !formData.nom ||
      !formData.prenom ||
      !formData.email ||
      !formData.mdp ||
      !formData.tel ||
      !formData.adresse ||
      !formData.role
    ) {
      setFormError("Tous les champs sont requis");
      return;
    }

    if (
      !/^[a-zA-Z]+$/.test(formData.nom) ||
      !/^[a-zA-Z]+$/.test(formData.prenom)
    ) {
      setFormError(
        "Le nom et le prénom doivent contenir uniquement des lettres"
      );
      return;
    }
    if (!["client", "proprietaire"].includes(formData.role)) {
      setFormError("Rôle invalide");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Format d'email invalide");
      return;
    }
    if (!/^\d{8,}$/.test(formData.tel)) {
      setFormError("Numéro de téléphone invalide");
      return;
    }
    if (formData.mdp.length < 6) {
      setFormError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      // Dans ViewProfile.js, fonction handleSubmit
      const submitData = new FormData();

      // Ne pas ajouter les champs vides pour éviter d'écraser les données existantes
      Object.keys(formData).forEach((key) => {
        if (key === "url_img" && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (
          key !== "url_img" &&
          key !== "confirmMdp" &&
          formData[key] !== "" &&
          formData[key] !== null
        ) {
          submitData.append(key, formData[key]);
        }
      });

      // Ajouter des logs pour déboguer
      console.log("📦 Données envoyées au serveur:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, typeof value === "object" ? "File object" : value);
      }

      // Il manque cette ligne pour envoyer les données au serveur
      const userData = await register(submitData);
      console.log("✅ Inscription réussie !");

      // IMPORTANT: Mettre à jour l'AuthContext avec les informations utilisateur
      if (userData && userData.token) {
        // Option 1: Utiliser le résultat de register directement
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);

        // Option 2: Utiliser la fonction login du AuthContext
        await login(userData.email, formData.mdp);
        navigate("/profile");
      }
    } catch (err) {
      setFormError(err.message);
      console.log("❌ Erreur lors de l'inscription :", err);
    }
  };
  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="register-card">
          <h2 className="register-title">Créez un compte</h2>
          <ProfileForm onSubmit={handleRegister} formError={formError} />
        </div>
      </div>
    </>
  );
};

export default Register;
