// services/reservationService.js
import axios from "axios";
import authService from "./authService";

const API_URL = "http://localhost:3000/api/reservations";
// Fonction pour obtenir l'en-tête d'authentification
const getConfigWithAuth = () => {
  const token = authService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
export const reservationService = {
  // Récupérer toutes les réservations des logements du propriétaire
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

  // Récupérer les réservations d'un logement spécifique
  getLogementReservations: async (logementId) => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.get(
        `${API_URL}/logResPourProp/logement//${logementId}`,
        config
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

  // Récupérer les réservations en attente du propriétaire
  getReservationsEnAttente: async () => {
    try {
      const config = getConfigWithAuth();
      const response = await axios.get(
        `${API_URL}/reservationsEnAttenteProprietaire`,
        config
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

  // Répondre à une réservation (confirmer ou refuser)
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
};
