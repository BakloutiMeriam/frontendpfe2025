import axios from "axios";

const API_URL = "http://localhost:3000/api/logement";
axios.defaults.withCredentials = true;

export const getToken = () => {
  return localStorage.getItem("token");
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const logementService = {
  createLogement: async (logementData) => {
    try {
      const formData = new FormData();

      // Ajouter les champs de base
      formData.append("titre", logementData.titre);
      formData.append("description", logementData.description);
      formData.append("prix", logementData.prix);
      formData.append("superficie", logementData.superficie);
      formData.append("nombreChambres", logementData.nombreChambres);
      formData.append("nombreSallesDeBain", logementData.nombreSallesDeBain);
      formData.append("categorie", logementData.categorie);
      formData.append("disponible", logementData.disponible);

      // Gestion de l'adresse
      formData.append("adresse[rue]", logementData.adresse.rue);
      formData.append("adresse[ville]", logementData.adresse.ville);
      formData.append("adresse[codePostal]", logementData.adresse.codePostal);
      formData.append("adresse[pays]", logementData.adresse.pays);

      // Gestion des amenités
      logementData.amenites.forEach((amenite, index) => {
        formData.append(`amenites[${index}]`, amenite);
      });

      // Gestion des fichiers
      if (logementData.photoprincipale && logementData.photoprincipale[0]) {
        formData.append("photoprincipale", logementData.photoprincipale[0]);
      }

      if (logementData.photos && logementData.photos.length) {
        logementData.photos.forEach((photo, index) => {
          formData.append("photos", photo);
        });
      }

      const response = await axios.post(`${API_URL}/insertLog`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Erreur détaillée lors de la création du logement:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/categories/listeCat`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      throw error;
    }
  },

  getMesLogements: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/proprietaire/mes-logements`,
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Préfixer les chemins d'images pour chaque logement
      const logements = response.data;
      const baseUrl = "http://localhost:3000/uploads/";

      return logements.map((logement) => {
        // Traiter l'image principale
        if (
          logement.photoprincipale &&
          !logement.photoprincipale.startsWith("http") &&
          !logement.photoprincipale.startsWith("data:") &&
          !logement.photoprincipale.startsWith("/api/")
        ) {
          logement.photoprincipale = baseUrl + logement.photoprincipale;
        }

        // Traiter les autres photos si nécessaire
        if (logement.photos && Array.isArray(logement.photos)) {
          logement.photos = logement.photos.map((photo) => {
            if (
              !photo.startsWith("http") &&
              !photo.startsWith("data:") &&
              !photo.startsWith("/api/")
            ) {
              return baseUrl + photo;
            }
            return photo;
          });
        }

        return logement;
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de mes logements:", error);
      throw error;
    }
  },
  updateLogement: async (id, logementData) => {
    try {
      const formData = new FormData();

      // Ajouter les champs de base (inchangé)
      formData.append("titre", logementData.titre);
      formData.append("description", logementData.description);
      formData.append("prix", logementData.prix);
      formData.append("superficie", logementData.superficie);
      formData.append("nombreChambres", logementData.nombreChambres);
      formData.append("nombreSallesDeBain", logementData.nombreSallesDeBain);

      // Gestion de la catégorie (inchangé)
      let categorieId = logementData.categorie;
      if (categorieId && typeof categorieId === "object") {
        categorieId = categorieId.id || categorieId._id || categorieId;
      }
      if (categorieId) {
        categorieId = categorieId.toString();
        formData.append("categorie", categorieId);
      }

      formData.append("disponible", logementData.disponible);

      // Gestion de l'adresse (inchangé)
      formData.append("adresse[rue]", logementData.adresse.rue);
      formData.append("adresse[ville]", logementData.adresse.ville);
      formData.append("adresse[codePostal]", logementData.adresse.codePostal);
      formData.append("adresse[pays]", logementData.adresse.pays);

      // Gestion des amenités (inchangé)
      logementData.amenites.forEach((amenite, index) => {
        formData.append(`amenites[${index}]`, amenite);
      });

      // CHANGÉ: Gestion des photos
      // Séparer les nouvelles photos (base64) des URLs existantes
      const existingPhotos = [];
      const newPhotos = [];

      if (logementData.photos && logementData.photos.length) {
        logementData.photos.forEach((photo) => {
          if (photo.startsWith("data:image")) {
            // C'est une nouvelle photo en base64
            newPhotos.push(photo);
          } else {
            // C'est une URL existante
            existingPhotos.push(photo);
          }
        });
      }

      // Envoyer les photos existantes dans un champ séparé
      if (existingPhotos.length > 0) {
        formData.append("existingPhotos", JSON.stringify(existingPhotos));
      }

      // Envoyer les nouvelles photos
      if (newPhotos.length > 0) {
        formData.append("newPhotos", JSON.stringify(newPhotos));
      }

      // CHANGÉ: Gestion de la photo principale
      if (logementData.photoprincipale) {
        if (logementData.photoprincipale.startsWith("data:image")) {
          // C'est une nouvelle photo principale en base64
          formData.append("newPhotoPrincipale", logementData.photoprincipale);
        } else {
          // C'est une URL existante
          formData.append(
            "existingPhotoPrincipale",
            logementData.photoprincipale
          );
        }
      }

      const response = await axios.put(`${API_URL}/updateLog/${id}`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Erreur détaillée:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
  deleteLogement: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteLog/${id}`, {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Erreur détaillée lors de la suppression du logement:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  toggleDisponibilite: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/updateDispo/${id}`,
        {},
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Erreur détaillée lors du changement de disponibilité:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
  getLogementById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/details/${id}`, {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const logement = response.data;
      const baseUrl = "http://localhost:3000/uploads/";

      // Ne préfixer que si le chemin n'a pas déjà un préfixe
      if (
        logement.photoprincipale &&
        !logement.photoprincipale.startsWith("http") &&
        !logement.photoprincipale.startsWith("data:") &&
        !logement.photoprincipale.startsWith("/api/")
      ) {
        logement.photoprincipale = baseUrl + logement.photoprincipale;
      }

      // Transformer les photos avec la même logique
      if (logement.photos && Array.isArray(logement.photos)) {
        logement.photos = logement.photos.map((photo) => {
          if (
            !photo.startsWith("http") &&
            !photo.startsWith("data:") &&
            !photo.startsWith("/api/")
          ) {
            return baseUrl + photo;
          }
          return photo;
        });
      }

      if (logement.categorie && !logement.categorie.id) {
        logement.categorie = {
          id: logement.categorie,
        };
      }
      return logement;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du logement:",
        error
      );
      throw error;
    }
  },
  getLogementsService: async () => {
    try {
      const response = await axios.get(`${API_URL}/listeLog`);
      const data = response.data;
      const baseUrl = "http://localhost:3000/uploads/";

      // Préfixer les chemins d'images pour chaque logement
      if (data.logements && Array.isArray(data.logements)) {
        data.logements = data.logements.map((logement) => {
          // Traiter l'image principale
          if (
            logement.photoprincipale &&
            !logement.photoprincipale.startsWith("http") &&
            !logement.photoprincipale.startsWith("data:") &&
            !logement.photoprincipale.startsWith("/api/")
          ) {
            logement.photoprincipale = baseUrl + logement.photoprincipale;
          }

          // Traiter les autres photos si nécessaire
          if (logement.photos && Array.isArray(logement.photos)) {
            logement.photos = logement.photos.map((photo) => {
              if (
                !photo.startsWith("http") &&
                !photo.startsWith("data:") &&
                !photo.startsWith("/api/")
              ) {
                return baseUrl + photo;
              }
              return photo;
            });
          }

          return logement;
        });
      }

      return data;
    } catch (error) {
      console.error("Erreur dans getLogementsService:", error);
      throw error;
    }
  },

  ajouterAuxFavoris: async (logementId) => {
    try {
      const response = await axios.post(
        `${API_URL}/favoris/${logementId}`,
        {},
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);
      throw error;
    }
  },

  getMesFavoris: async () => {
    try {
      const response = await axios.get(`${API_URL}/mes-favoris`, {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error);
      throw error;
    }
  },

  supprimerDesFavoris: async (logementId) => {
    try {
      const response = await axios.delete(`${API_URL}/favoris/${logementId}`, {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suppression des favoris:", error);
      throw error;
    }
  },
  // Ajoutez cette méthode à votre objet logementService
  getLogementsDisponibles: async (page = 1, limit = 10, filters = {}) => {
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams({
        page,
        limit,
        ...filters,
      });

      const response = await axios.get(
        `${API_URL}/logementDisponible?${params}`,
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = response.data;
      const baseUrl = "http://localhost:3000/uploads/";

      // Préfixer les chemins d'images pour chaque logement
      if (data.logements && Array.isArray(data.logements)) {
        data.logements = data.logements.map((logement) => {
          // Traiter l'image principale
          if (
            logement.photoprincipale &&
            !logement.photoprincipale.startsWith("http") &&
            !logement.photoprincipale.startsWith("data:") &&
            !logement.photoprincipale.startsWith("/api/")
          ) {
            logement.photoprincipale = baseUrl + logement.photoprincipale;
          }

          // Traiter les autres photos si nécessaire
          if (logement.photos && Array.isArray(logement.photos)) {
            logement.photos = logement.photos.map((photo) => {
              if (
                !photo.startsWith("http") &&
                !photo.startsWith("data:") &&
                !photo.startsWith("/api/")
              ) {
                return baseUrl + photo;
              }
              return photo;
            });
          }

          return logement;
        });
      }

      return data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des logements disponibles:",
        error
      );
      throw error;
    }
  },
};
