import React, { useState, useEffect } from "react";
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
          {/* Informations de base */}
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

          {/* Adresse */}
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

          {/* Détails du logement */}
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

          {/* Catégorie */}
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

          {/* Amenités */}
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

          {/* Disponibilité */}
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

          {/* Photos */}
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

export default AddLogementForm;
