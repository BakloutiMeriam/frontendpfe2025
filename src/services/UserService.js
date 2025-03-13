import axios from "axios";
import authService from "./authService";

const API_URL = "http://localhost:3000/api/user";
const API = "http://localhost:3000/api/admin";

const UserService = {
  register: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
};

export default UserService;
