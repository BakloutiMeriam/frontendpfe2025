import axios from "axios";
import authService from "./authService";

const API_URL = "http://localhost:3000/api/user";
const API = "http://localhost:3000/api/admin";

const UserService = {
  getProprietaires: async () => {
    try {
      const response = await axios.get(`${API_URL}/proprietaires`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching proprietaires:", error);
      throw error;
    }
  },
  getClients: async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },
  register: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Erreur lors de l'inscription");
    }
  },
  getUsers: async () => {
    try {
      const response = await axios.get(`${API}/users`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(
        `${API}/update-user/${userId}`,
        userData,
        {
          withCredentials: true,
          headers: authService.authHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || "Erreur lors de la mise à jour de l'utilisateur"
      );
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API}/delete-user/${userId}`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Erreur lors de la suppression");
    }
  },

  getUserProfileClient: async () => {
    try {
      const response = await axios.get(`${API_URL}/client/profile`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || "Erreur lors de la récupération du profil"
      );
    }
  },

  getUserProfileProp: async () => {
    try {
      const response = await axios.get(`${API_URL}/proprietaire/profile`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || "Erreur lors de la récupération du profil"
      );
    }
  },
  updateUserProfile: async (formData) => {
    try {
      const response = await axios.put(`${API_URL}/Updateprofile`, formData, {
        withCredentials: true,
        headers: {
          ...authService.authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil"
      );
    }
  },

  deleteUserProfile: async () => {
    try {
      const response = await axios.delete(`${API_URL}/DeleteProfile`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la désactivation du profil"
      );
    }
  },

  // Récupérer les propriétaires en attente
  getPendingProprietaires: async () => {
    try {
      const response = await axios.get(`${API_URL}/proprietaires/pending`, {
        withCredentials: true,
        headers: authService.authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des propriétaires en attente:",
        error
      );
      throw error;
    }
  },

  // Approuver un propriétaire - CORRECTION ICI
  approveProprietaire: async (userId) => {
    try {
      const response = await axios.put(
        `${API_URL}/approve/${userId}`,
        {},
        {
          withCredentials: true,
          headers: authService.authHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'approbation du propriétaire:", error);
      throw error;
    }
  },

  // Rejeter un propriétaire - CORRECTION ICI
  rejectProprietaire: async (userId, reason) => {
    try {
      const response = await axios.post(
        `${API_URL}/reject/${userId}`,
        { reason },
        {
          withCredentials: true,
          headers: authService.authHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du rejet du propriétaire:", error);
      throw error;
    }
  },
};

export default UserService;
