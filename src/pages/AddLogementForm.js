import React, { useState, useEffect } from "react";
import { logementService } from "../services/LogementService";
import Layout from "../components/Layout";
import {
  MapPin,
  Home,
  Euro,
  Check,
  Coffee,
  Wifi,
  Car,
  ChevronRight,
  ChevronLeft,
  Plus,
} from "lucide-react";
import "../styles/addlogementform.css";
const AddLogementForm = () => {
  // État pour gérer les étapes du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    adresse: {
      rue: "",
      ville: "",
      codePostal: "",
      pays: "",
      latitude: null,
      longitude: null,
    },
    adresseMethod: "manual", // 'manual' ou 'map'
    prix: "",
    superficie: "",
    nombreChambres: 1,
    nombreSallesDeBain: 1,
    categorie: "",
    amenites: [],
    customAmenites: [], // Pour les aménités personnalisées
    disponible: true,
    photoprincipale: null,
    photos: [],
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");

  // Simuler les icônes de catégorie (dans un projet réel, ces données viendraient de l'API)
  const categoryIcons = {
    Appartement: <Home size={24} />,
    Maison: <Home size={24} />,
    Villa: <Home size={24} />,
    Studio: <Home size={24} />,
    // Ajoutez d'autres catégories selon vos besoins
  };

  const predefinedAmenities = [
    { name: "Wifi", icon: <Wifi size={20} /> },
    { name: "Parking", icon: <Car size={20} /> },
    { name: "Cuisine", icon: <Coffee size={20} /> },
    { name: "Terrasse", icon: <Home size={20} /> },
    { name: "Climatisation", icon: <Home size={20} /> },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Récupérer les catégories
        const categoriesData = await logementService.getCategories();
        setCategories(categoriesData);

        // Simuler la récupération de la liste des pays
        // Dans un projet réel, vous utiliseriez une API pour cela
        setCountries([
          "France",
          "Tunisie",
          "Maroc",
          "Algérie",
          "Italie",
          "Espagne",
          "Allemagne",
          "Royaume-Uni",
          "États-Unis",
          "Canada",
        ]);
      } catch (error) {
        console.error("Erreur de chargement des données initiales", error);
      }
    };

    fetchInitialData();
  }, []);

  // Effet pour charger les villes lorsqu'un pays est sélectionné
  useEffect(() => {
    if (formData.adresse.pays) {
      // Simuler la récupération des villes basées sur le pays sélectionné
      // Dans un projet réel, vous utiliseriez une API pour cela
      const fetchCities = async () => {
        // Simulation de délai réseau
        setTimeout(() => {
          if (formData.adresse.pays === "Tunisie") {
            setCities(["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"]);
          } else if (formData.adresse.pays === "France") {
            setCities(["Paris", "Lyon", "Marseille", "Toulouse", "Nice"]);
          } else if (formData.adresse.pays === "Maroc") {
            setCities(["Casablanca", "Rabat", "Marrakech", "Agadir", "Tanger"]);
          } else {
            // Villes génériques pour les autres pays
            setCities(["Capitale", "Ville1", "Ville2", "Ville3"]);
          }
        }, 300);
      };

      fetchCities();
    } else {
      setCities([]);
    }
  }, [formData.adresse.pays]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      if (name === "photoprincipale") {
        setFormData((prev) => ({
          ...prev,
          [name]: files ? files[0] : null,
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
    } else if (name === "adresseMethod") {
      setFormData((prev) => ({
        ...prev,
        adresseMethod: value,
      }));
    } else if (name === "amenites") {
      const ameniteValue = value;
      const isChecked = checked;

      setFormData((prev) => ({
        ...prev,
        amenites: isChecked
          ? [...prev.amenites, ameniteValue]
          : prev.amenites.filter((a) => a !== ameniteValue),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleMapSelection = (coordinates) => {
    // Cette fonction serait appelée lorsque l'utilisateur sélectionne un point sur la carte
    setFormData((prev) => ({
      ...prev,
      adresse: {
        ...prev.adresse,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      },
    }));

    // Dans un projet réel, vous pourriez utiliser un service de géocodage inverse
    // pour récupérer les informations d'adresse basées sur les coordonnées
  };

  const addCustomAmenity = () => {
    if (
      newAmenity.trim() !== "" &&
      !formData.amenites.includes(newAmenity) &&
      !formData.customAmenites.includes(newAmenity)
    ) {
      setFormData((prev) => ({
        ...prev,
        customAmenites: [...prev.customAmenites, newAmenity.trim()],
        amenites: [...prev.amenites, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const removeCustomAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      customAmenites: prev.customAmenites.filter((a) => a !== amenity),
      amenites: prev.amenites.filter((a) => a !== amenity),
    }));
  };

  const nextStep = () => {
    // Ici, vous pourriez ajouter une validation spécifique à chaque étape
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    // Validation spécifique à chaque étape
    if (currentStep === 1) {
      if (!formData.titre || formData.titre.trim().length < 3) {
        newErrors.titre = "Le titre doit contenir au moins 3 caractères";
      }
      if (!formData.description || formData.description.trim().length < 10) {
        newErrors.description =
          "La description doit contenir au moins 10 caractères";
      }
    } else if (currentStep === 2) {
      if (formData.adresseMethod === "manual") {
        if (!formData.adresse.pays) {
          newErrors.pays = "Le pays est obligatoire";
        }
        if (!formData.adresse.ville) {
          newErrors.ville = "La ville est obligatoire";
        }
        if (!formData.adresse.rue) {
          newErrors.rue = "La rue est obligatoire";
        }
        if (!formData.adresse.codePostal) {
          newErrors.codePostal = "Le code postal est obligatoire";
        }
      } else if (formData.adresseMethod === "map") {
        if (!formData.adresse.latitude || !formData.adresse.longitude) {
          newErrors.map = "Veuillez sélectionner un emplacement sur la carte";
        }
      }
    } else if (currentStep === 3) {
      if (
        !formData.prix ||
        isNaN(Number(formData.prix)) ||
        Number(formData.prix) <= 0
      ) {
        newErrors.prix = "Le prix doit être un nombre positif";
      }
      if (
        !formData.superficie ||
        isNaN(Number(formData.superficie)) ||
        Number(formData.superficie) <= 0
      ) {
        newErrors.superficie = "La superficie doit être un nombre positif";
      }
    } else if (currentStep === 4) {
      if (!formData.categorie) {
        newErrors.categorie = "La catégorie est obligatoire";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    // Validation globale avant soumission
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

    if (!formData.categorie) {
      newErrors.categorie = "La catégorie est obligatoire";
    }

    // Vérification adresse
    if (formData.adresseMethod === "manual") {
      if (!formData.adresse.rue) newErrors.rue = "La rue est obligatoire";
      if (!formData.adresse.ville) newErrors.ville = "La ville est obligatoire";
      if (!formData.adresse.codePostal)
        newErrors.codePostal = "Le code postal est obligatoire";
      if (!formData.adresse.pays) newErrors.pays = "Le pays est obligatoire";
    } else {
      if (!formData.adresse.latitude || !formData.adresse.longitude) {
        newErrors.map = "Veuillez sélectionner un emplacement sur la carte";
      }
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

        // Réinitialiser le formulaire et revenir à la première étape
        setFormData({
          titre: "",
          description: "",
          adresse: {
            rue: "",
            ville: "",
            codePostal: "",
            pays: "",
            latitude: null,
            longitude: null,
          },
          adresseMethod: "manual",
          prix: "",
          superficie: "",
          nombreChambres: 1,
          nombreSallesDeBain: 1,
          categorie: "",
          amenites: [],
          customAmenites: [],
          disponible: true,
          photoprincipale: null,
          photos: [],
        });
        setCurrentStep(1);
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

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`flex items-center ${index > 0 ? "flex-1" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index + 1 === currentStep
                    ? "bg-blue-500 text-white"
                    : index + 1 < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1 < currentStep ? <Check size={16} /> : index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`h-1 flex-1 ${
                    index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <div className="w-20 text-center">Détails</div>
          <div className="w-20 text-center">Adresse</div>
          <div className="w-20 text-center">Caractéristiques</div>
          <div className="w-20 text-center">Équipements</div>
          <div className="w-20 text-center">Photos</div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="animate-fadeIn">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Informations de base
        </h3>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Titre du Logement</label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Ex: Magnifique appartement avec vue sur mer"
          />
          {errors.titre && (
            <p className="text-red-500 mt-1 text-sm">{errors.titre}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Décrivez votre logement en détail..."
            rows="5"
          />
          {errors.description && (
            <p className="text-red-500 mt-1 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="disponible"
              checked={formData.disponible}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2">Disponible immédiatement</span>
          </label>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="animate-fadeIn">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Adresse du logement
        </h3>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() =>
                handleChange({
                  target: { name: "adresseMethod", value: "manual" },
                })
              }
              className={`py-2 px-4 text-sm font-medium rounded-l-lg ${
                formData.adresseMethod === "manual"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Saisie manuelle
            </button>
            <button
              type="button"
              onClick={() =>
                handleChange({
                  target: { name: "adresseMethod", value: "map" },
                })
              }
              className={`py-2 px-4 text-sm font-medium rounded-r-lg ${
                formData.adresseMethod === "map"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sélectionner sur la carte
            </button>
          </div>
        </div>

        {formData.adresseMethod === "manual" ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Pays</label>
              <select
                name="adresse.pays"
                value={formData.adresse.pays}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Sélectionnez un pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.pays && (
                <p className="text-red-500 mt-1 text-sm">{errors.pays}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Ville</label>
              <select
                name="adresse.ville"
                value={formData.adresse.ville}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={!formData.adresse.pays}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.ville && (
                <p className="text-red-500 mt-1 text-sm">{errors.ville}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Rue</label>
              <input
                type="text"
                name="adresse.rue"
                value={formData.adresse.rue}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ex: 123 Rue du Commerce"
              />
              {errors.rue && (
                <p className="text-red-500 mt-1 text-sm">{errors.rue}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Code Postal</label>
              <input
                type="text"
                name="adresse.codePostal"
                value={formData.adresse.codePostal}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ex: 75001"
              />
              {errors.codePostal && (
                <p className="text-red-500 mt-1 text-sm">{errors.codePostal}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-2 h-80 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={40} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Ici s'affichera la carte pour sélectionner l'emplacement
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Dans l'implémentation finale, intégrez une carte interactive ici
              </p>
              {errors.map && (
                <p className="text-red-500 mt-1 text-sm">{errors.map}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="animate-fadeIn">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Caractéristiques du logement
        </h3>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block mb-2 font-medium">Prix</label>
            <div className="relative">
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Prix"
              />
              <Euro
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            {errors.prix && (
              <p className="text-red-500 mt-1 text-sm">{errors.prix}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">Superficie (m²)</label>
            <input
              type="number"
              name="superficie"
              value={formData.superficie}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Superficie"
            />
            {errors.superficie && (
              <p className="text-red-500 mt-1 text-sm">{errors.superficie}</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <label className="block mb-4 font-medium">Nombre de Chambres</label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  nombreChambres: Math.max(
                    1,
                    parseInt(prev.nombreChambres) - 1
                  ),
                }))
              }
              className="w-12 h-12 bg-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-300 transition"
            >
              -
            </button>
            <input
              type="number"
              name="nombreChambres"
              value={formData.nombreChambres}
              onChange={handleChange}
              className="w-20 h-12 text-center border-t border-b border-gray-300 focus:outline-none"
              min="1"
            />
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  nombreChambres: parseInt(prev.nombreChambres) + 1,
                }))
              }
              className="w-12 h-12 bg-gray-200 rounded-r-lg flex items-center justify-center hover:bg-gray-300 transition"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-4 font-medium">
            Nombre de Salles de Bain
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  nombreSallesDeBain: Math.max(
                    1,
                    parseInt(prev.nombreSallesDeBain) - 1
                  ),
                }))
              }
              className="w-12 h-12 bg-gray-200 rounded-l-lg flex items-center justify-center hover:bg-gray-300 transition"
            >
              -
            </button>
            <input
              type="number"
              name="nombreSallesDeBain"
              value={formData.nombreSallesDeBain}
              onChange={handleChange}
              className="w-20 h-12 text-center border-t border-b border-gray-300 focus:outline-none"
              min="1"
            />
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  nombreSallesDeBain: parseInt(prev.nombreSallesDeBain) + 1,
                }))
              }
              className="w-12 h-12 bg-gray-200 rounded-r-lg flex items-center justify-center hover:bg-gray-300 transition"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6 text-center">
            Catégorie et Équipements
          </h3>

          <label className="block mb-4 font-medium">Catégorie</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() =>
                  handleChange({
                    target: { name: "categorie", value: cat._id },
                  })
                }
                className={`cursor-pointer p-4 border rounded-lg hover:border-blue-500 transition ${
                  formData.categorie === cat._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    {categoryIcons[cat.nom] || <Home size={24} />}
                  </div>
                  <span className="text-center">{cat.nom}</span>
                </div>
              </div>
            ))}
          </div>
          {errors.categorie && (
            <p className="text-red-500 mt-1 text-sm mb-4">{errors.categorie}</p>
          )}
        </div>

        <div>
          <label className="block mb-4 font-medium">
            Équipements disponibles
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {predefinedAmenities.map((amenity) => (
              <div
                key={amenity.name}
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={`amenity-${amenity.name}`}
                  name="amenites"
                  value={amenity.name}
                  checked={formData.amenites.includes(amenity.name)}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`amenity-${amenity.name}`}
                  className="flex items-center cursor-pointer"
                >
                  <div className="mr-2">{amenity.icon}</div>
                  <span>{amenity.name}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Ajouter un équipement personnalisé
            </label>
            <div className="flex">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ex: Jacuzzi"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {formData.customAmenites.length > 0 && (
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Équipements personnalisés
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.customAmenites.map((amenity) => (
                  <div
                    key={amenity}
                    className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 flex items-center"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(amenity)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    return (
      <div className="animate-fadeIn">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Photos du logement
        </h3>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Photo Principale</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.photoprincipale ? (
              <div className="mb-4">
                <div className="relative w-full h-48 mb-2 bg-gray-100 rounded overflow-hidden">
                  <p className="absolute inset-0 flex items-center justify-center">
                    Photo sélectionnée : {formData.photoprincipale.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, photoprincipale: null }))
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Home size={24} className="text-gray-500" />
                  </div>
                </div>
                <p className="text-gray-500 mb-2">
                  Glissez et déposez votre photo principale ici
                </p>
                <p className="text-gray-400 text-sm mb-4">ou</p>
              </>
            )}
            <input
              type="file"
              name="photoprincipale"
              onChange={handleChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="photoprincipale"
            />
            <label
              htmlFor="photoprincipale"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition"
            >
              Parcourir
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Photos Supplémentaires
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.photos.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2">
                  {formData.photos.length} photo(s) sélectionnée(s)
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[...Array(Math.min(3, formData.photos.length))].map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-20 bg-gray-100 rounded flex items-center justify-center"
                      >
                        <p className="text-xs text-center p-1">
                          Photo {index + 1}
                        </p>
                      </div>
                    )
                  )}
                </div>
                {formData.photos.length > 3 && (
                  <p className="text-sm text-gray-500 mb-2">
                    + {formData.photos.length - 3} autre(s) photo(s)
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, photos: [] }))
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer toutes les photos
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Home size={24} className="text-gray-500" />
                  </div>
                </div>
                <p className="text-gray-500 mb-2">
                  Glissez et déposez plusieurs photos ici
                </p>
                <p className="text-gray-400 text-sm mb-4">ou</p>
              </>
            )}
            <input
              type="file"
              name="photos"
              onChange={handleChange}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="photos"
            />
            <label
              htmlFor="photos"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition"
            >
              Parcourir
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  const renderNavButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center hover:bg-gray-300 transition"
          >
            <ChevronLeft size={16} className="mr-1" /> Précédent
          </button>
        ) : (
          <div></div> // Espace vide pour maintenir l'alignement flexbox
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition"
          >
            Suivant <ChevronRight size={16} className="ml-1" />
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded flex items-center hover:bg-green-600 transition"
          >
            Ajouter le Logement <Check size={16} className="ml-1" />
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Ajouter un Logement
        </h2>

        {renderProgressBar()}

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Erreur</p>
            <p>{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderCurrentStep()}
          {renderNavButtons()}
        </form>
      </div>
    </Layout>
  );
};

export default AddLogementForm;
