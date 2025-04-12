import axios from "axios";
import authService from "./authService";
const API_URL = "http://localhost:3000/api/reservations";
export const getToken = () => {
  return localStorage.getItem("token");
};
const getConfigWithAuth = () => {
  const token = authService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
axios.defaults.withCredentials = true;

export const reservationService = {
  // Créer une nouvelle réservation
  /*createReservation: async (reservationData) => {
    try {
      const response = await axios.post(
        `${API_URL}/creerReservation`,
        reservationData,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      throw error;
    }
  },*/
  createReservation: async (reservationData) => {
    try {
      const response = await axios.post(
        `${API_URL}/creerReservation`,
        reservationData,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);

      // Propager l'erreur avec les détails
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Erreur de réservation");
      }
      throw error;
    }
  },
  // Obtenir les réservations de l'utilisateur connecté
  getUserReservations: async () => {
    try {
      const response = await axios.get(`${API_URL}/reservationsClient`, {
        headers: {
          ...authHeader(),
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      throw error;
    }
  },

  // Obtenir une réservation spécifique
  getReservation: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/consultRes/${id}`, {
        headers: {
          ...authHeader(),
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la réservation:", error);
      throw error;
    }
  },

  // Mettre à jour une réservation
  updateReservation: async (id, reservationData) => {
    try {
      const response = await axios.put(
        `${API_URL}/update/${id}`,
        reservationData,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      // Extraire le message d'erreur spécifique du backend
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }
      console.error("Erreur lors de la mise à jour de la réservation:", error);
      throw new Error("Erreur lors de la mise à jour de la réservation");
    }
  },

  // Annuler une réservation (client)
  cancelReservation: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/client/${id}/annulerRes`,
        { statut: "annulée" },
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error);
      throw error;
    }
  },

  // Obtenir les réservations pour un logement (propriétaire)
  getLogementReservations: async (logementId) => {
    try {
      const response = await axios.get(
        `${API_URL}/logResPourProp/logement/${logementId}`,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations du logement:",
        error
      );
      throw error;
    }
  },

  // Répondre à une réservation (propriétaire)
  repondreReservation: async (reservationId, statut) => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.put(
        `${API_URL}/repondre/${reservationId}`,
        { statut },
        config
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la réponse à la réservation:", error);
      throw error;
    }
  },

  // Obtenir les réservations en attente (propriétaire)
  getReservationsEnAttente: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/reservationsEnAttenteProprietaire`,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations en attente:",
        error
      );
      throw error;
    }
  },
  getAllReservationsConfirmee: async (logementId) => {
    console.log("Fetching reservations for logement:", logementId);
    try {
      const response = await axios.get(
        `${API_URL}/allResconfirmee/${logementId}`,
        {
          headers: { ...authHeader() },
          withCredentials: true,
        }
      );

      console.log("Tous les statuts disponibles:", [
        ...new Set(response.data.map((res) => res.statut)),
      ]);
      console.log("Toutes les réservations:", response.data);

      // Inclure les statuts qui rendent les dates indisponibles
      // Généralement: confirmée, en attente, etc.
      const reservationsBloquantes = response.data.filter(
        (res) => res.statut === "confirmée"
      );
      console.log("Réservations bloquantes filtrées:", reservationsBloquantes);

      return reservationsBloquantes;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return [];
    }
  },
  getProprietaireReservations: async () => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.get(
        `${API_URL}/proprietaire/reservations`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une réservation à "terminée"
  terminerReservation: async (reservationId) => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.put(
        `${API_URL}/reservations/statut/${reservationId}`,
        { statut: "terminée" },
        config
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de la réservation:",
        error
      );
      throw error;
    }
  },
  getClientsProprietaire: async () => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.get(
        `${API_URL}/proprietaire/clients`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllReservations: async () => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.get(`${API_URL}/allResAdmin`, config);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      throw error;
    }
  },
};
