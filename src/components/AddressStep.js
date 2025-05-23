import React, { useState, useEffect, useRef } from "react";
import "../styles/addresse.css";

// Composant pour l'étape 2 - Adresse style Airbnb avec API pour pays et villes et carte interactive
const AddressStep = ({ formData, setFormData, errors }) => {
  const [addressInputMode, setAddressInputMode] = useState("search"); // "search" ou "manual"
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [debug, setDebug] = useState(""); // Pour le débogage

  // États pour la carte
  const [mapPosition, setMapPosition] = useState([36.8065, 10.1815]); // Position par défaut (Tunis)
  const [markerPosition, setMarkerPosition] = useState([36.8065, 10.1815]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Charger la liste des pays au montage du composant
  useEffect(() => {
    fetchCountries();

    // Charger la bibliothèque Leaflet de manière conditionnelle
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Création d'un élément script pour charger Leaflet CSS
        const linkElement = document.createElement("link");
        linkElement.rel = "stylesheet";
        linkElement.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
        document.head.appendChild(linkElement);

        // Attendre que la feuille de style soit chargée
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Création d'un élément script pour charger Leaflet JS
        const scriptElement = document.createElement("script");
        scriptElement.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
        scriptElement.async = true;

        // Attendre que le script soit chargé
        scriptElement.onload = () => {
          console.log("Leaflet chargé avec succès");
          initializeMap();
        };

        document.body.appendChild(scriptElement);
      } else if (window.L) {
        console.log("Leaflet déjà chargé");
        initializeMap();
      }
    };

    loadLeaflet();

    // Nettoyage à la destruction du composant
    return () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Initialiser la carte une fois Leaflet chargé
  const initializeMap = () => {
    if (!window.L || mapLoaded) return;

    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    try {
      // Créer la carte
      const map = window.L.map("map-container").setView(mapPosition, 13);

      // Ajouter les tuiles OpenStreetMap
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Ajouter un marqueur déplaçable
      const marker = window.L.marker(markerPosition, {
        draggable: true,
      }).addTo(map);

      // Événement lorsque le marqueur est déplacé
      marker.on("dragend", async function (e) {
        const position = marker.getLatLng();
        setMarkerPosition([position.lat, position.lng]);

        // Récupérer l'adresse à partir des coordonnées (géocodage inverse)
        await reverseGeocode(position.lat, position.lng);
      });

      // Événement lorsqu'on clique sur la carte
      map.on("click", async function (e) {
        marker.setLatLng(e.latlng);
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);

        // Récupérer l'adresse à partir des coordonnées (géocodage inverse)
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      // Stocker les références pour les utiliser plus tard
      mapRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la carte:", error);
    }
  };

  // Géocodage inverse - Obtenir l'adresse à partir des coordonnées
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "fr",
            "User-Agent": "AddressFormComponent/1.0",
          },
        }
      );

      const data = await response.json();

      if (data && data.address) {
        const address = data.address;

        // S'assurer que tous les champs requis sont présents
        const rue = `${address.house_number ? address.house_number + " " : ""}${
          address.road || address.street || "Adresse non spécifiée"
        }`;

        // Pour la ville, essayer plusieurs champs possibles
        const ville =
          address.city ||
          address.town ||
          address.village ||
          address.state ||
          address.county ||
          "Ville non spécifiée";

        // S'assurer qu'on a un code postal
        const codePostal = address.postcode || "00000";

        // Mettre à jour le formulaire avec l'adresse trouvée
        setFormData((prev) => ({
          ...prev,
          adresse: {
            ...prev.adresse,
            rue: rue,
            ville: ville,
            codePostal: codePostal,
            pays: address.country || prev.adresse.pays || "France",
          },
        }));

        // Mettre à jour la requête de recherche pour afficher l'adresse complète
        setSearchQuery(data.display_name || "");
        console.log("Adresse mise à jour depuis la carte:", {
          rue,
          ville,
          codePostal,
          pays: address.country,
        });
      }
    } catch (error) {
      console.error("Erreur lors du géocodage inverse:", error);
    }
  };
  // Mettre à jour les régions quand le pays change
  useEffect(() => {
    if (formData.adresse.pays) {
      console.log("Pays sélectionné:", formData.adresse.pays);
      fetchRegionsByCountry(formData.adresse.pays);
      // Réinitialiser la ville
      setFormData((prev) => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          ville: "",
          codePostal: "",
        },
      }));
    }
  }, [formData.adresse.pays]);

  // Fonction pour récupérer les pays via l'API RESTCountries
  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name"
      );
      const data = await response.json();

      // Extraction et tri des noms de pays
      const countryNames = data
        .map((country) => country.name.common)
        .sort((a, b) => a.localeCompare(b, "fr"));

      setCountries(countryNames);
      console.log("Pays chargés:", countryNames.length);
    } catch (error) {
      console.error("Erreur lors du chargement des pays:", error);
      // Fallback en cas d'erreur
      setCountries([
        "France",
        "Tunisie",
        "États-Unis",
        "Maroc",
        "Canada",
        "Royaume-Uni",
        "Espagne",
        "Italie",
        "Allemagne",
        "Algérie",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les régions par pays via des données statiques
  // Pour éviter les problèmes d'API croisées et de limitations
  const fetchRegionsByCountry = async (country) => {
    try {
      setIsLoading(true);
      console.log("Chargement des régions pour:", country);

      // IMPORTANT: Définir un fallback statique pour garantir le fonctionnement
      const fallbackRegions = {
        Tunisia: [
          "Ariana",
          "Béja",
          "Ben Arous",
          "Bizerte",
          "Gabès",
          "Gafsa",
          "Jendouba",
          "Kairouan",
          "Kasserine",
          "Kébili",
          "Le Kef",
          "Mahdia",
          "Manouba",
          "Médenine",
          "Monastir",
          "Nabeul",
          "Sfax",
          "Sidi Bouzid",
          "Siliana",
          "Sousse",
          "Tataouine",
          "Tozeur",
          "Tunis",
          "Zaghouan",
        ],
        France: [
          "Auvergne-Rhône-Alpes",
          "Bourgogne-Franche-Comté",
          "Bretagne",
          "Centre-Val de Loire",
          "Corse",
          "Grand Est",
          "Hauts-de-France",
          "Île-de-France",
          "Normandie",
          "Nouvelle-Aquitaine",
          "Occitanie",
          "Pays de la Loire",
          "Provence-Alpes-Côte d'Azur",
        ],
        Marocco: [
          "Tanger-Tétouan-Al Hoceima",
          "Oriental",
          "Fès-Meknès",
          "Rabat-Salé-Kénitra",
          "Béni Mellal-Khénifra",
          "Casablanca-Settat",
          "Marrakech-Safi",
          "Drâa-Tafilalet",
          "Souss-Massa",
          "Guelmim-Oued Noun",
          "Laâyoune-Sakia El Hamra",
          "Dakhla-Oued Ed-Dahab",
        ],
        "États-Unis": [
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "Californie",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Floride",
          "Géorgie",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiane",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "Nouveau-Mexique",
          "New York",
          "Caroline du Nord",
          "Dakota du Nord",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvanie",
          "Rhode Island",
          "Caroline du Sud",
          "Dakota du Sud",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginie",
          "Washington",
          "Virginie-Occidentale",
          "Wisconsin",
          "Wyoming",
        ],
        Canada: [
          "Alberta",
          "Colombie-Britannique",
          "Manitoba",
          "Nouveau-Brunswick",
          "Terre-Neuve-et-Labrador",
          "Territoires du Nord-Ouest",
          "Nouvelle-Écosse",
          "Nunavut",
          "Ontario",
          "Île-du-Prince-Édouard",
          "Québec",
          "Saskatchewan",
          "Yukon",
        ],
        Algeria: [
          "Adrar",
          "Chlef",
          "Laghouat",
          "Oum El Bouaghi",
          "Batna",
          "Béjaïa",
          "Biskra",
          "Béchar",
          "Blida",
          "Bouira",
          "Tamanrasset",
          "Tébessa",
          "Tlemcen",
          "Tiaret",
          "Tizi Ouzou",
          "Alger",
          "Djelfa",
          "Jijel",
          "Sétif",
          "Saïda",
          "Skikda",
          "Sidi Bel Abbès",
          "Annaba",
          "Guelma",
          "Constantine",
          "Médéa",
          "Mostaganem",
          "M'Sila",
          "Mascara",
          "Ouargla",
          "Oran",
          "El Bayadh",
          "Illizi",
          "Bordj Bou Arréridj",
          "Boumerdès",
          "El Tarf",
          "Tindouf",
          "Tissemsilt",
          "El Oued",
          "Khenchela",
          "Souk Ahras",
          "Tipaza",
          "Mila",
          "Aïn Defla",
          "Naâma",
          "Aïn Témouchent",
          "Ghardaïa",
          "Relizane",
        ],
        "Royaume-Uni": [
          "Angleterre",
          "Écosse",
          "Pays de Galles",
          "Irlande du Nord",
        ],
        Espagne: [
          "Andalousie",
          "Aragon",
          "Asturies",
          "Îles Baléares",
          "Pays basque",
          "Îles Canaries",
          "Cantabrie",
          "Castille-et-León",
          "Castille-La Manche",
          "Catalogne",
          "Estrémadure",
          "Galice",
          "Madrid",
          "Murcie",
          "Navarre",
          "La Rioja",
          "Communauté valencienne",
        ],
        Italy: [
          "Abruzzes",
          "Basilicate",
          "Calabre",
          "Campanie",
          "Émilie-Romagne",
          "Frioul-Vénétie Julienne",
          "Latium",
          "Ligurie",
          "Lombardie",
          "Marches",
          "Molise",
          "Piémont",
          "Pouilles",
          "Sardaigne",
          "Sicile",
          "Toscane",
          "Trentin-Haut-Adige",
          "Ombrie",
          "Vallée d'Aoste",
          "Vénétie",
        ],
        Allemagne: [
          "Bade-Wurtemberg",
          "Bavière",
          "Berlin",
          "Brandebourg",
          "Brême",
          "Hambourg",
          "Hesse",
          "Mecklembourg-Poméranie-Occidentale",
          "Basse-Saxe",
          "Rhénanie-du-Nord-Westphalie",
          "Rhénanie-Palatinat",
          "Sarre",
          "Saxe",
          "Saxe-Anhalt",
          "Schleswig-Holstein",
          "Thuringe",
        ],
      };

      // Vérifier d'abord si nous avons des données statiques pour ce pays
      if (fallbackRegions[country]) {
        console.log("Utilisation des données statiques pour:", country);
        setRegions(fallbackRegions[country]);
        setDebug(
          `Régions chargées (statique): ${fallbackRegions[country].length}`
        );
        return; // Arrêter la fonction si les données statiques sont disponibles
      }

      // Si nous n'avons pas de données statiques, essayer l'API
      // Remplacer par votre nom d'utilisateur Geonames

      // Obtenir le code du pays
      const countryCode = await getCountryCode(country);

      if (!countryCode) {
        console.error("Code pays non trouvé pour:", country);
        setRegions([]);
        setDebug("Erreur: Code pays non trouvé");
        return;
      }

      // IMPORTANT: Utilisez HTTPS au lieu de HTTP pour éviter les erreurs de contenu mixte
      const response = await fetch(
        `https://secure.geonames.org/searchJSON?country=FR&featureClass=A&featureCode=ADM1&maxRows=1000&username=contactlemonde
`
      );

      const data = await response.json();

      if (data && data.geonames && data.geonames.length > 0) {
        // Extraire les noms des régions uniques
        const regionNames = [
          ...new Set(data.geonames.map((item) => item.name)),
        ];
        const sortedRegions = regionNames.sort((a, b) =>
          a.localeCompare(b, "fr")
        );

        console.log("Régions chargées depuis l'API:", sortedRegions.length);
        setRegions(sortedRegions);
        setDebug(`Régions chargées (API): ${sortedRegions.length}`);
      } else {
        // Si l'API retourne des résultats vides ou mal formatés, utiliser le fallback
        if (fallbackRegions[country]) {
          console.log(
            "API sans résultats, utilisation du fallback pour:",
            country
          );
          setRegions(fallbackRegions[country]);
          setDebug(
            `Régions chargées (fallback): ${fallbackRegions[country].length}`
          );
        } else {
          setRegions([]);
          setDebug(
            "Aucune région trouvée1 via l'API ni dans les données statiques"
          );
        }
      }
    } catch (error) {
      console.error(
        `Erreur lors du chargement des régions pour ${country}:`,
        error
      );

      // En cas d'erreur, essayer le fallback
      const fallbackRegions = {
        Tunisia: [
          "Ariana",
          "Béja",
          "Ben Arous",
          "Bizerte",
          "Gabès",
          "Gafsa",
          "Jendouba",
          "Kairouan",
          "Kasserine",
          "Kébili",
          "Le Kef",
          "Mahdia",
          "Manouba",
          "Médenine",
          "Monastir",
          "Nabeul",
          "Sfax",
          "Sidi Bouzid",
          "Siliana",
          "Sousse",
          "Tataouine",
          "Tozeur",
          "Tunis",
          "Zaghouan",
        ],
        France: [
          "Auvergne-Rhône-Alpes",
          "Bourgogne-Franche-Comté",
          "Bretagne",
          "Centre-Val de Loire",
          "Corse",
          "Grand Est",
          "Hauts-de-France",
          "Île-de-France",
          "Normandie",
          "Nouvelle-Aquitaine",
          "Occitanie",
          "Pays de la Loire",
          "Provence-Alpes-Côte d'Azur",
        ],
        Marocco: [
          "Tanger-Tétouan-Al Hoceima",
          "Oriental",
          "Fès-Meknès",
          "Rabat-Salé-Kénitra",
          "Béni Mellal-Khénifra",
          "Casablanca-Settat",
          "Marrakech-Safi",
          "Drâa-Tafilalet",
          "Souss-Massa",
          "Guelmim-Oued Noun",
          "Laâyoune-Sakia El Hamra",
          "Dakhla-Oued Ed-Dahab",
        ],
        "États-Unis": [
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "Californie",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Floride",
          "Géorgie",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiane",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "Nouveau-Mexique",
          "New York",
          "Caroline du Nord",
          "Dakota du Nord",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvanie",
          "Rhode Island",
          "Caroline du Sud",
          "Dakota du Sud",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginie",
          "Washington",
          "Virginie-Occidentale",
          "Wisconsin",
          "Wyoming",
        ],
        Canada: [
          "Alberta",
          "Colombie-Britannique",
          "Manitoba",
          "Nouveau-Brunswick",
          "Terre-Neuve-et-Labrador",
          "Territoires du Nord-Ouest",
          "Nouvelle-Écosse",
          "Nunavut",
          "Ontario",
          "Île-du-Prince-Édouard",
          "Québec",
          "Saskatchewan",
          "Yukon",
        ],
        Algeria: [
          "Adrar",
          "Chlef",
          "Laghouat",
          "Oum El Bouaghi",
          "Batna",
          "Béjaïa",
          "Biskra",
          "Béchar",
          "Blida",
          "Bouira",
          "Tamanrasset",
          "Tébessa",
          "Tlemcen",
          "Tiaret",
          "Tizi Ouzou",
          "Alger",
          "Djelfa",
          "Jijel",
          "Sétif",
          "Saïda",
          "Skikda",
          "Sidi Bel Abbès",
          "Annaba",
          "Guelma",
          "Constantine",
          "Médéa",
          "Mostaganem",
          "M'Sila",
          "Mascara",
          "Ouargla",
          "Oran",
          "El Bayadh",
          "Illizi",
          "Bordj Bou Arréridj",
          "Boumerdès",
          "El Tarf",
          "Tindouf",
          "Tissemsilt",
          "El Oued",
          "Khenchela",
          "Souk Ahras",
          "Tipaza",
          "Mila",
          "Aïn Defla",
          "Naâma",
          "Aïn Témouchent",
          "Ghardaïa",
          "Relizane",
        ],
        "Royaume-Uni": [
          "Angleterre",
          "Écosse",
          "Pays de Galles",
          "Irlande du Nord",
        ],
        Espagne: [
          "Andalousie",
          "Aragon",
          "Asturies",
          "Îles Baléares",
          "Pays basque",
          "Îles Canaries",
          "Cantabrie",
          "Castille-et-León",
          "Castille-La Manche",
          "Catalogne",
          "Estrémadure",
          "Galice",
          "Madrid",
          "Murcie",
          "Navarre",
          "La Rioja",
          "Communauté valencienne",
        ],
        Italy: [
          "Abruzzes",
          "Basilicate",
          "Calabre",
          "Campanie",
          "Émilie-Romagne",
          "Frioul-Vénétie Julienne",
          "Latium",
          "Ligurie",
          "Lombardie",
          "Marches",
          "Molise",
          "Piémont",
          "Pouilles",
          "Sardaigne",
          "Sicile",
          "Toscane",
          "Trentin-Haut-Adige",
          "Ombrie",
          "Vallée d'Aoste",
          "Vénétie",
        ],
        Allemagne: [
          "Bade-Wurtemberg",
          "Bavière",
          "Berlin",
          "Brandebourg",
          "Brême",
          "Hambourg",
          "Hesse",
          "Mecklembourg-Poméranie-Occidentale",
          "Basse-Saxe",
          "Rhénanie-du-Nord-Westphalie",
          "Rhénanie-Palatinat",
          "Sarre",
          "Saxe",
          "Saxe-Anhalt",
          "Schleswig-Holstein",
          "Thuringe",
        ],
      };

      if (fallbackRegions[country]) {
        console.log("Erreur API, utilisation du fallback pour:", country);
        setRegions(fallbackRegions[country]);
        setDebug(
          `Régions chargées (fallback après erreur): ${fallbackRegions[country].length}`
        );
      } else {
        setRegions([]);
        setDebug(
          `Erreur: ${error.message}. Aucune région disponible pour ce pays.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction auxiliaire pour obtenir le code du pays à partir de son nom
  const getCountryCode = async (countryName) => {
    try {
      // Utiliser l'API RESTCountries pour obtenir le code ISO à 2 lettres du pays
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
      );
      const data = await response.json();

      if (data && data.length > 0 && data[0].cca2) {
        return data[0].cca2;
      }

      // Fallback pour certains pays courants si l'API ne répond pas
      const countryCodes = {
        France: "FR",
        Tunisie: "TN",
        "États-Unis": "US",
        Maroc: "MA",
        Canada: "CA",
        "Royaume-Uni": "GB",
        Espagne: "ES",
        Italie: "IT",
        Allemagne: "DE",
        Algérie: "DZ",
      };

      return countryCodes[countryName] || "";
    } catch (error) {
      console.error("Erreur lors de la récupération du code pays:", error);
      // Utiliser le fallback directement en cas d'erreur
      const countryCodes = {
        France: "FR",
        Tunisie: "TN",
        "États-Unis": "US",
        Maroc: "MA",
        Canada: "CA",
        "Royaume-Uni": "GB",
        Espagne: "ES",
        Italie: "IT",
        Allemagne: "DE",
        Algérie: "DZ",
      };
      return countryCodes[countryName] || "";
    }
  };

  // Rechercher l'adresse complète à partir du code postal pour auto-compléter
  const fetchAddressFromPostcode = async (postcode, country) => {
    if (!postcode || postcode.length < 3 || !country) return;

    try {
      const query = `${postcode}, ${country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            "Accept-Language": "fr",
            "User-Agent": "AddressFormComponent/1.0",
          },
        }
      );

      const data = await response.json();

      if (data && data[0] && data[0].address) {
        const address = data[0].address;

        // Mettre à jour la ville si elle n'est pas déjà définie
        // Ici la ville contient en fait l'état/région
        if (!formData.adresse.ville && (address.state || address.county)) {
          setFormData((prev) => ({
            ...prev,
            adresse: {
              ...prev.adresse,
              ville: address.state || address.county,
            },
          }));
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'adresse à partir du code postal:",
        error
      );
    }
  };

  // Fonction pour rechercher des adresses via Nominatim
  const searchAddress = async (query) => {
    if (query.length < 3) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "fr",
            "User-Agent": "AddressFormComponent/1.0",
          },
        }
      );

      const data = await response.json();

      // Transformer les résultats en format utilisable
      const formattedResults = data.map((item) => {
        const address = item.address || {};
        const state = address.state || address.county || "";
        const country = address.country || "";
        const postcode = address.postcode || "";
        const street = address.road || "";
        const houseNumber = address.house_number || "";
        const display = `${state ? state + ", " : ""}${country}`;

        return {
          display,
          state,
          country,
          postcode,
          street,
          houseNumber,
          fullAddress: item.display_name,
        };
      });

      setSuggestions(formattedResults);
      setShowSuggestions(formattedResults.length > 0);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    if (name === "searchQuery") {
      setSearchQuery(value);
      if (value.length > 2) {
        searchAddress(value);
      } else {
        setShowSuggestions(false);
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

      // Si le code postal change, essayer de compléter automatiquement
      if (
        adresseKey === "codePostal" &&
        value.length >= 3 &&
        formData.adresse.pays
      ) {
        fetchAddressFromPostcode(value, formData.adresse.pays);
      }
    }
  };

  const selectSuggestion = (suggestion) => {
    // S'assurer que tous les champs requis sont présents
    const rue = `${suggestion.houseNumber ? suggestion.houseNumber + " " : ""}${
      suggestion.street || "Adresse non spécifiée"
    }`;

    const ville = suggestion.state || suggestion.city || "Ville non spécifiée";

    setFormData((prev) => ({
      ...prev,
      adresse: {
        ...prev.adresse,
        ville: ville,
        pays: suggestion.country || prev.adresse.pays || "France",
        codePostal: suggestion.postcode || prev.adresse.codePostal || "00000",
        rue: rue,
      },
    }));

    setSearchQuery(suggestion.fullAddress);
    setShowSuggestions(false);

    // Mettre à jour la position de la carte et du marqueur
    if (
      suggestion.lat &&
      suggestion.lon &&
      mapRef.current &&
      markerRef.current
    ) {
      const newPosition = [
        parseFloat(suggestion.lat),
        parseFloat(suggestion.lon),
      ];
      setMapPosition(newPosition);
      setMarkerPosition(newPosition);

      mapRef.current.setView(newPosition, 15);
      markerRef.current.setLatLng(newPosition);
    }

    console.log("Adresse mise à jour depuis suggestion:", {
      rue,
      ville,
      codePostal: suggestion.postcode,
      pays: suggestion.country,
    });
  };

  const toggleAddressMode = (mode) => {
    setAddressInputMode(mode);

    // Si on passe en mode recherche, on réinitialise la carte
    if (mode === "search" && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  };
  // Géolocaliser l'utilisateur
  const geolocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];

          // Mettre à jour la carte et le marqueur
          if (mapRef.current && markerRef.current) {
            setMapPosition(newPosition);
            setMarkerPosition(newPosition);

            mapRef.current.setView(newPosition, 15);
            markerRef.current.setLatLng(newPosition);

            // Faire un géocodage inverse pour obtenir l'adresse
            await reverseGeocode(latitude, longitude);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          alert(
            "Impossible de vous localiser. Veuillez vérifier vos paramètres de localisation."
          );
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <div className="step-content fade-in">
      <div className="addr-airbnb-address-container">
        <div className="addr-address-header">
          <h4 className="addr-address-subtitle">
            Où est situé votre logement?
          </h4>
        </div>

        <div className="addr-address-mode-selector">
          <button
            type="button"
            className={`addr-address-mode-btn ${
              addressInputMode === "search" ? "active" : ""
            }`}
            onClick={() => toggleAddressMode("search")}
          >
            <span className="addr-address-mode-icon">🔍</span>
            Rechercher
          </button>
          <button
            type="button"
            className={`addr-address-mode-btn ${
              addressInputMode === "manual" ? "active" : ""
            }`}
            onClick={() => toggleAddressMode("manual")}
          >
            <span className="addr-address-mode-icon">✏️</span>
            Saisie manuelle
          </button>
        </div>

        {addressInputMode === "search" ? (
          <div className="addr-address-search-container">
            <div className="addr-address-search-wrapper">
              <input
                type="text"
                name="searchQuery"
                value={searchQuery}
                onChange={handleAddressChange}
                className="addr-address-search-input"
                placeholder="Saisissez l'adresse de votre logement"
              />
              <span className="addr-address-search-icon">
                {isLoading ? "⏳" : "🔍"}
              </span>
            </div>

            {showSuggestions && (
              <div className="addr-address-suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="addr-address-suggestion-item"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="addr-suggestion-icon">📍</span>
                    <span className="addr-suggestion-text">
                      {suggestion.fullAddress}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="addr-address-map-container">
              {/* Bouton de géolocalisation */}
              <button
                type="button"
                className="addr-geolocate-button"
                onClick={geolocateUser}
                title="Utiliser ma position actuelle"
              >
                <span className="addr-geolocate-icon">📍</span>
                Ma position
              </button>

              {/* Container pour la carte */}
              <div
                id="map-container"
                className="leaflet-map"
                style={{ height: "300px", width: "100%", borderRadius: "12px" }}
              >
                {!mapLoaded && (
                  <div className="addr-map-loading">
                    <span>Chargement de la carte...</span>
                  </div>
                )}
              </div>

              <div className="addr-map-instructions">
                <p>
                  Déplacez le marqueur ou cliquez sur la carte pour définir
                  l'emplacement précis
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="addr-address-manual-container">
            <div className="form-group">
              <label className="form-label">Pays</label>
              <div className="addr-airbnb-select-container">
                <select
                  name="adresse.pays"
                  value={formData.adresse.pays}
                  onChange={handleAddressChange}
                  className="form-control addr-airbnb-select"
                >
                  <option value="">Sélectionnez un pays</option>
                  {isLoading && countries.length === 0 && (
                    <option value="" disabled>
                      Chargement des pays...
                    </option>
                  )}
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <span className="addr-select-arrow">▼</span>
              </div>
              {errors.pays && <p className="error-message">{errors.pays}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Région / État</label>
              <div className="addr-airbnb-select-container">
                <select
                  name="adresse.ville"
                  value={formData.adresse.ville || ""}
                  onChange={handleAddressChange}
                  className="form-control addr-airbnb-select"
                  disabled={!formData.adresse.pays}
                >
                  <option value="">
                    {isLoading
                      ? "Chargement des régions..."
                      : !formData.adresse.pays
                      ? "Sélectionnez d'abord un pays"
                      : "Sélectionnez une région"}
                  </option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <span className="addr-select-arrow">▼</span>
              </div>
              {errors.ville && <p className="error-message">{errors.ville}</p>}
            </div>

            {/* Ajout d'une zone de débogage (à supprimer en production) */}
            {debug && (
              <div
                className="debug-info"
                style={{
                  fontSize: "12px",
                  color: "#666",
                  padding: "5px",
                  margin: "10px 0",
                }}
              >
                {debug}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Code Postal</label>
              <input
                type="text"
                name="adresse.codePostal"
                value={formData.adresse.codePostal}
                onChange={handleAddressChange}
                className="form-control addr-airbnb-input"
                placeholder="Code Postal"
              />
              {errors.codePostal && (
                <p className="error-message">{errors.codePostal}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Rue</label>
              <input
                type="text"
                name="adresse.rue"
                value={formData.adresse.rue}
                onChange={handleAddressChange}
                className="form-control addr-airbnb-input"
                placeholder="Numéro et nom de rue"
              />
              {errors.rue && <p className="error-message">{errors.rue}</p>}
            </div>
          </div>
        )}

        <div className="addr-address-confirmation">
          <div className="addr-address-privacy-note">
            <span className="addr-privacy-icon">🔒</span>
            <p>
              Votre adresse sera vérifiée et sécurisée pour la confiance des
              voyageurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressStep;
