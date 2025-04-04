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
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de mes logements:", error);
      throw error;
    }
  },
  updateLogement: async (id, logementData) => {
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
        "Erreur détaillée lors de la mise à jour du logement:",
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
        `${API_URL}/updateDispo/${id}/disponible`,
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
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error("Erreur dans getLogementsService:", error);
      throw error;
    }
  },

  // Dans LogementService.js - Ces méthodes semblent déjà être présentes dans votre code partagé
  // mais assurez-vous qu'elles sont correctement configurées avec les headers d'authentification

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
};
