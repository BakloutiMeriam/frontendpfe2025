import { useContext, useState, useEffect } from "react";
import { ProfileContext } from "../context/ProfileContext";
import ProfileForm from "../components/ProfileForm";

const Register = () => {
  const { register, error } = useContext(ProfileContext);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleRegister = async (formData) => {
    setFormError("");
    console.log("🔹 FormData reçu :", formData);
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
      const formDataObject = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataObject.append(key, formData[key]);
      });
      console.log("📤 Données envoyées :", formDataObject);
      await register(formDataObject);
      console.log("✅ Inscription réussie !");
    } catch (err) {
      setFormError(err.message);
      console.log("❌ Erreur lors de l'inscription :", err);
    }
  };

  return (
    <div className="register-container">
      <h2>Créer un compte </h2>
      {formError && <p className="error-message">{formError}</p>}
      <ProfileForm onSubmit={handleRegister} />
    </div>
  );
};

export default Register;
