/*import React, { useState, useEffect } from "react";
import { logementService } from "../services/LogementService";
import Layout from "../components/Layout";

const AddLogementForm = () => {
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    adresse: {
      rue: "",
      ville: "",
      codePostal: "",
      pays: "Tunisie",
    },
    prix: "",
    superficie: "",
    nombreChambres: "",
    nombreSallesDeBain: "",
    categorie: "",
    amenites: [],
    disponible: true,
    photoprincipale: null,
    photos: [],
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await logementService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erreur de chargement des catégories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (name === "photoprincipale") {
        setFormData((prev) => ({
          ...prev,
          [name]: files ? Array.from(files) : null,
        }));
      } else if (name === "photos") {
        setFormData((prev) => ({
          ...prev,
          [name]: files ? Array.from(files) : [],
        }));
      }
    } else if (name.startsWith("adresse.")) {
      const adresseKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          [adresseKey]: value,
        },
      }));
    } else if (name === "amenites") {
      const currentAmenites = formData.amenites;
      const updatedAmenites = currentAmenites.includes(value)
        ? currentAmenites.filter((a) => a !== value)
        : [...currentAmenites, value];

      setFormData((prev) => ({
        ...prev,
        amenites: updatedAmenites,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? e.target.checked : value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre || formData.titre.trim().length < 3) {
      newErrors.titre = "Le titre doit contenir au moins 3 caractères";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères";
    }

    if (
      !formData.prix ||
      isNaN(Number(formData.prix)) ||
      Number(formData.prix) <= 0
    ) {
      newErrors.prix = "Le prix doit être un nombre positif";
    }

    if (!formData.adresse.rue) {
      newErrors.rue = "La rue est obligatoire";
    }

    if (!formData.adresse.ville) {
      newErrors.ville = "La ville est obligatoire";
    }

    if (!formData.adresse.codePostal) {
      newErrors.codePostal = "Le code postal est obligatoire";
    }

    if (!formData.categorie) {
      newErrors.categorie = "La catégorie est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (validateForm()) {
      try {
        const result = await logementService.createLogement(formData);
        console.log("Logement créé avec succès:", result);

        // Réinitialiser le formulaire
        setFormData({
          titre: "",
          description: "",
          adresse: {
            rue: "",
            ville: "",
            codePostal: "",
            pays: "France",
          },
          prix: "",
          superficie: "",
          nombreChambres: "",
          nombreSallesDeBain: "",
          categorie: "",
          amenites: [],
          disponible: true,
          photoprincipale: null,
          photos: [],
        });
      } catch (error) {
        console.error("Erreur lors de la création du logement", error);

        if (error.response) {
          setSubmitError(
            error.response.data.message ||
              "Une erreur s'est produite lors de la création du logement"
          );
        } else if (error.request) {
          setSubmitError("Pas de réponse du serveur. Veuillez réessayer.");
        } else {
          setSubmitError(
            "Erreur de configuration. Veuillez contacter le support."
          );
        }
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Ajouter un Logement</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Titre du Logement</label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Titre du logement"
            />
            {errors.titre && <p className="text-red-500">{errors.titre}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Description détaillée"
              rows="4"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Adresse</h3>
            <input
              type="text"
              name="adresse.rue"
              value={formData.adresse.rue}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
              placeholder="Rue"
            />
            <input
              type="text"
              name="adresse.ville"
              value={formData.adresse.ville}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
              placeholder="Ville"
            />
            <input
              type="text"
              name="adresse.codePostal"
              value={formData.adresse.codePostal}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
              placeholder="Code Postal"
            />
            <input
              type="text"
              name="adresse.pays"
              value={formData.adresse.pays}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Pays"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2">Prix</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Prix"
              />
              {errors.prix && <p className="text-red-500">{errors.prix}</p>}
            </div>

            <div>
              <label className="block mb-2">Superficie (m²)</label>
              <input
                type="number"
                name="superficie"
                value={formData.superficie}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Superficie"
              />
            </div>

            <div>
              <label className="block mb-2">Nombre de Chambres</label>
              <input
                type="number"
                name="nombreChambres"
                value={formData.nombreChambres}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Chambres"
              />
            </div>

            <div>
              <label className="block mb-2">Nombre de Salles de Bain</label>
              <input
                type="number"
                name="nombreSallesDeBain"
                value={formData.nombreSallesDeBain}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Salles de Bain"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Catégorie</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nom}
                </option>
              ))}
            </select>
            {errors.categorie && (
              <p className="text-red-500">{errors.categorie}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2">Amenités</label>
            <div className="flex flex-wrap gap-2">
              {["Wifi", "Parking", "Cuisine", "Terrasse", "Climatisation"].map(
                (amenite) => (
                  <label
                    key={amenite}
                    className="inline-flex items-center mr-4"
                  >
                    <input
                      type="checkbox"
                      name="amenites"
                      value={amenite}
                      checked={formData.amenites.includes(amenite)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {amenite}
                  </label>
                )
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                className="mr-2"
              />
              Disponible
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Photo Principale</label>
            <input
              type="file"
              name="photoprincipale"
              onChange={handleChange}
              accept="image/jpeg,image/png,image/webp"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Photos Supplémentaires</label>
            <input
              type="file"
              name="photos"
              onChange={handleChange}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Ajouter le Logement
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddLogementForm;*/
import React, { useState, useEffect } from "react";
import { logementService } from "../services/LogementService";
import AddressStep from "../components/AddressStep"; // Importez le nouveau composant
import "../styles/addlogementform.css";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import NavbarHome from "../components/NavbarHome.js";

const AddLogementForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    adresse: {
      rue: "",
      ville: "",
      codePostal: "",
      pays: "Tunisie",
    },
    prix: "",
    superficie: "",
    nombreChambres: "",
    nombreSallesDeBain: "",
    categorie: "",
    amenites: [],
    disponible: true,
    photoprincipale: null,
    photos: [],
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Étapes du formulaire
  const steps = [
    "Informations de base",
    "Adresse",
    "Détails du logement",
    "Catégorie et Aménités",
    "Photos",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await logementService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erreur de chargement des catégories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      if (name === "photoprincipale") {
        setFormData((prev) => ({
          ...prev,
          [name]: files && files.length > 0 ? files[0] : null,
        }));
        // Debug - vérifier que le fichier est bien capturé
        if (files && files.length > 0) {
          console.log("Photo principale sélectionnée:", files[0].name);
        }
      } else if (name === "photos") {
        setFormData((prev) => ({
          ...prev,
          [name]: files ? Array.from(files) : [],
        }));
      }
    } else if (name.startsWith("adresse.")) {
      const adresseKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          [adresseKey]: value,
        },
      }));
    } else if (name === "amenites") {
      const currentAmenites = formData.amenites;
      const updatedAmenites = currentAmenites.includes(value)
        ? currentAmenites.filter((a) => a !== value)
        : [...currentAmenites, value];

      setFormData((prev) => ({
        ...prev,
        amenites: updatedAmenites,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1: // Informations de base
        if (!formData.titre || formData.titre.trim().length < 3) {
          newErrors.titre = "Le titre doit contenir au moins 3 caractères";
        }
        if (!formData.description || formData.description.trim().length < 10) {
          newErrors.description =
            "La description doit contenir au moins 10 caractères";
        }
        break;
      case 2: // Adresse - assouplir les règles pour le mode recherche
        if (formData.adresse.ville === "") {
          newErrors.ville = "La ville est obligatoire";
        }
        if (formData.adresse.pays === "") {
          newErrors.pays = "Le pays est obligatoire";
        }
        break;
      case 3: // Détails du logement
        if (
          !formData.prix ||
          isNaN(Number(formData.prix)) ||
          Number(formData.prix) <= 0
        ) {
          newErrors.prix = "Le prix doit être un nombre positif";
        }
        break;
      case 4: // Catégorie et Aménités
        if (!formData.categorie) {
          newErrors.categorie = "La catégorie est obligatoire";
        }
        break;
      case 5: // Photos - validation optionnelle
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre || formData.titre.trim().length < 3) {
      newErrors.titre = "Le titre doit contenir au moins 3 caractères";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères";
    }

    if (
      !formData.prix ||
      isNaN(Number(formData.prix)) ||
      Number(formData.prix) <= 0
    ) {
      newErrors.prix = "Le prix doit être un nombre positif";
    }

    if (!formData.adresse.ville) {
      newErrors.ville = "La ville est obligatoire";
    }

    if (!formData.adresse.pays) {
      newErrors.pays = "Le pays est obligatoire";
    }

    if (!formData.categorie) {
      newErrors.categorie = "La catégorie est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);
    // Log pour déboguer avant de soumettre
    console.log("État du formData avant soumission:", formData);
    console.log("Photo principale avant soumission:", formData.photoprincipale);
    // Validation spécifique pour l'adresse
    const addressErrors = {};
    if (!formData.adresse.rue) addressErrors.rue = "La rue est obligatoire";
    if (!formData.adresse.ville)
      addressErrors.ville = "La ville est obligatoire";
    if (!formData.adresse.codePostal)
      addressErrors.codePostal = "Le code postal est obligatoire";

    // Mettre à jour les erreurs
    if (Object.keys(addressErrors).length > 0) {
      setErrors({ ...errors, ...addressErrors });
      setIsSubmitting(false);
      return;
    }

    if (validateForm()) {
      try {
        // Assurez-vous que l'adresse est correctement formatée
        const formDataToSend = {
          ...formData,
          adresse: {
            rue: formData.adresse.rue,
            ville: formData.adresse.ville,
            codePostal: formData.adresse.codePostal,
            pays: formData.adresse.pays || "Tunisie",
          },
          // Assurez-vous que photoprincipale est un objet File et non un tableau
          photoprincipale: formData.photoprincipale,
        };
        console.log("FormData prêt à être envoyé:", formDataToSend);

        console.log(
          "Type de photoprincipale:",
          typeof formData.photoprincipale
        );
        console.log(
          "photoprincipale est-il un File?",
          formData.photoprincipale instanceof File
        );
        if (formData.photoprincipale) {
          console.log(
            "Nom de la photo principale:",
            formData.photoprincipale.name
          );
        }
        const result = await logementService.createLogement(formDataToSend);
        console.log("Logement créé avec succès:", result);

        // Stocker un indicateur dans le localStorage pour l'alerte sur la page d'accueil
        localStorage.setItem("logementCreated", "true");
        setSubmitSuccess(true);
        // Redirection vers la page d'accueil après un court délai
        setTimeout(() => {
          navigate("/");
        }, 10);

        // Réinitialiser le formulaire
        setFormData({
          titre: "",
          description: "",
          adresse: {
            rue: "",
            ville: "",
            codePostal: "",
            pays: "Tunisie",
          },
          prix: "",
          superficie: "",
          nombreChambres: "",
          nombreSallesDeBain: "",
          categorie: "",
          amenites: [],
          disponible: true,
          photoprincipale: null,
          photos: [],
        });

        // Réinitialiser le formulaire, etc...
      } catch (error) {
        // Gestion des erreurs...
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };
  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content fade-in">
            <div className="form-group">
              <label className="form-label">Titre du Logement</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: Appartement lumineux au cœur de la ville"
              />
              {errors.titre && <p className="error-message">{errors.titre}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                placeholder="Décrivez votre logement en détail (emplacement, ambiance, équipements spéciaux...)"
                rows="6"
              />
              {errors.description && (
                <p className="error-message">{errors.description}</p>
              )}
            </div>
          </div>
        );
      case 2:
        // Utiliser notre nouveau composant d'adresse style Airbnb
        return (
          <AddressStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case 3:
        return (
          <div className="step-content fade-in">
            <div className="form-group">
              <label className="form-label">Prix par nuit (TND)</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className="form-control"
                placeholder="Prix par nuit"
              />
              {errors.prix && <p className="error-message">{errors.prix}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Superficie (m²)</label>
              <input
                type="number"
                name="superficie"
                value={formData.superficie}
                onChange={handleChange}
                className="form-control"
                placeholder="Surface en m²"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de Chambres</label>
              <div className="quantity-selector">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`quantity-btn ${
                      formData.nombreChambres === num ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, nombreChambres: num })
                    }
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de Salles de Bain</label>
              <div className="quantity-selector">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`quantity-btn ${
                      formData.nombreSallesDeBain === num ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, nombreSallesDeBain: num })
                    }
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content fade-in">
            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <div className="category-selector">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`category-item ${
                      formData.categorie === cat._id ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, categorie: cat._id })
                    }
                  >
                    <div className="category-icon">🏠</div>
                    <div className="category-name">{cat.nom}</div>
                  </div>
                ))}
              </div>
              {errors.categorie && (
                <p className="error-message">{errors.categorie}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Aménités</label>
              <div className="amenities-grid">
                {[
                  { name: "Wifi", icon: "📶" },
                  { name: "Parking", icon: "🅿️" },
                  { name: "Cuisine", icon: "🍳" },
                  { name: "Terrasse", icon: "🏞️" },
                  { name: "Climatisation", icon: "❄️" },
                  { name: "Piscine", icon: "🏊" },
                  { name: "Télévision", icon: "📺" },
                  { name: "Machine à laver", icon: "🧺" },
                ].map((amenite) => (
                  <div
                    key={amenite.name}
                    className={`amenity-card ${
                      formData.amenites.includes(amenite.name) ? "active" : ""
                    }`}
                    onClick={() => {
                      const currentAmenites = formData.amenites;
                      const updatedAmenites = currentAmenites.includes(
                        amenite.name
                      )
                        ? currentAmenites.filter((a) => a !== amenite.name)
                        : [...currentAmenites, amenite.name];
                      setFormData({ ...formData, amenites: updatedAmenites });
                    }}
                  >
                    <div className="amenity-icon">{amenite.icon}</div>
                    <div className="amenity-name">{amenite.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="availability-toggle">
                <label className="toggle-label">
                  <span>Ce logement est disponible à la location</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="disponible"
                      checked={formData.disponible}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content fade-in">
            <div className="form-group">
              <label className="form-label">Photo Principale</label>
              <div className="photo-upload-container">
                <div className="photo-upload">
                  <label className="photo-upload-label">
                    <span className="photo-upload-icon">📷</span>
                    <span className="photo-upload-text">
                      Ajouter une photo principale
                    </span>
                    <input
                      type="file"
                      name="photoprincipale"
                      onChange={handleChange}
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                    />
                  </label>
                  {formData.photoprincipale && (
                    <div className="photo-preview">
                      <img
                        src={URL.createObjectURL(formData.photoprincipale)}
                        alt="Preview"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() =>
                          setFormData({ ...formData, photoprincipale: null })
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Photos Supplémentaires</label>
              <div className="photo-upload-container">
                <div className="photo-upload multiple">
                  <label className="photo-upload-label">
                    <span className="photo-upload-icon">📸</span>
                    <span className="photo-upload-text">
                      Ajouter des photos supplémentaires
                    </span>
                    <input
                      type="file"
                      name="photos"
                      onChange={handleChange}
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                {formData.photos.length > 0 && (
                  <div className="photos-grid">
                    {Array.from(formData.photos).map((photo, index) => (
                      <div key={index} className="photo-preview">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-photo"
                          onClick={() => {
                            const newPhotos = Array.from(formData.photos);
                            newPhotos.splice(index, 1);
                            setFormData({ ...formData, photos: newPhotos });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <NavbarHome />
      <div className="airbnb-form-container">
        <div className="form-header">
          <h2 className="form-title">Ajouter votre logement</h2>
        </div>

        {submitError && <div className="error-banner">{submitError}</div>}

        <form onSubmit={handleSubmit} className="airbnb-form">
          <div className="step-container">
            <h3 className="step-title">{steps[currentStep - 1]}</h3>
            {renderStep()}
          </div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="secondary-button"
                onClick={prevStep}
              >
                Retour
              </button>
            )}
            {currentStep < steps.length + 1 ? (
              <button
                type="button"
                className="primaryy-button"
                onClick={nextStep}
              >
                {currentStep === steps.length
                  ? "Ajouter le logement"
                  : "Suivant"}
              </button>
            ) : (
              <button
                type="submit"
                className={`primary-button ${isSubmitting ? "loading" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création en cours..." : "Ajouter le logement"}
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddLogementForm;
