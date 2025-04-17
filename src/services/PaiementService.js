import axios from "axios";

const API_URL = "http://localhost:3000/api/payment";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

axios.defaults.withCredentials = true;

const paiementService = {
  /**
   * Initialise un paiement pour une commande
   * @param {string} commandeId - ID de la commande à payer
   * @returns {Promise} - Promise avec la réponse de l'API
   */
  // Dans paiementService.js
  initierPaiement: async (commandeId) => {
    try {
      const response = await axios.get(
        `${API_URL}/commande/${commandeId}/initier`,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data; // Retournez juste response.data, pas response.data.data
    } catch (error) {
      console.error("Erreur lors de l'initialisation du paiement:", error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Erreur de paiement");
      }
      throw new Error("Non autorisé, pas de token"); // Message plus explicite
    }
  },
  /**
   * Confirme un paiement après traitement par Stripe
   * @param {string} commandeId - ID de la commande
   * @param {object} paiementDetails - Détails du paiement
   * @returns {Promise} - Promise avec la réponse de l'API
   */
  confirmerPaiement: async (commandeId, paiementDetails) => {
    try {
      const response = await axios.post(
        `${API_URL}/commande/${commandeId}/confirmer`,
        paiementDetails,
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la confirmation du paiement:", error);
      if (error.response && error.response.data) {
        throw new Error(
          error.response.data.message || "Erreur de confirmation"
        );
      }
      throw error;
    }
  },

  /**
   * Demande un remboursement pour un paiement
   * @param {string} paymentId - ID du paiement à rembourser
   * @returns {Promise} - Promise avec la réponse de l'API
   */
  demanderRemboursement: async (paymentId) => {
    try {
      const response = await axios.post(
        `${API_URL}/remboursement/${paymentId}`,
        {},
        {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la demande de remboursement:", error);
      if (error.response && error.response.data) {
        throw new Error(
          error.response.data.message || "Erreur de remboursement"
        );
      }
      throw error;
    }
  },

  /**
   * Récupère l'historique des paiements de l'utilisateur
   * @returns {Promise} - Promise avec la réponse de l'API
   */
  getHistoriquePaiements: async () => {
    try {
      const response = await axios.get(`${API_URL}/historique`, {
        headers: {
          ...authHeader(),
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des paiements:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère les détails d'un paiement spécifique
   * @param {string} paymentId - ID du paiement
   * @returns {Promise} - Promise avec la réponse de l'API
   */
  getDetailsPaiement: async (paymentId) => {
    try {
      const response = await axios.get(`${API_URL}/paiements/${paymentId}`, {
        headers: {
          ...authHeader(),
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du paiement:",
        error
      );
      throw error;
    }
  },
};

export default paiementService;
