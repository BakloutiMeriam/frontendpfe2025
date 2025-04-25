// services/chatbotService.js
import axios from "axios";
const API_URL = "http://localhost:3000/api/chatbot";

// Fonction pour récupérer le token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Fonction pour construire l'en-tête Authorization
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Service de chatbot
export const chatbotService = {
  // Créer une nouvelle conversation
  createConversation: async (message) => {
    try {
      const response = await axios.post(
        `${API_URL}/conversations`,
        { message },
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
      console.error("Erreur lors de la création de la conversation:", error);
      throw error;
    }
  },

  // Envoyer un message dans une conversation existante
  sendMessage: async (conversationId, message) => {
    try {
      const response = await axios.post(
        `${API_URL}/conversations/${conversationId}/messages`,
        { message },
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
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  },

  // Récupérer les conversations d'un client
  getConversations: async (clientId) => {
    try {
      const response = await axios.get(
        `${API_URL}/client/${clientId}/conversations`,
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
      console.error("Erreur lors de la récupération des conversations:", error);
      throw error;
    }
  },

  // Récupérer une conversation spécifique
  getConversation: async (conversationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/conversations/${conversationId}`,
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
        "Erreur lors de la récupération de la conversation:",
        error
      );
      throw error;
    }
  },

  // Mettre à jour le statut d'une conversation (pour admins)
  updateConversationStatus: async (conversationId, statut) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/chatbot/admin/conversations/${conversationId}/status`,
        { statut },
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
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  },

  // Récupérer toutes les conversations (pour admins)
  getAllConversations: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/api/chatbot/admin/conversations?${queryParams}`,
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
      console.error("Erreur lors de la récupération des conversations:", error);
      throw error;
    }
  },
};
