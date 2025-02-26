import axios from "axios";

const API_URL = "http://localhost:3000/api/user";

const UserService = {
  register: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Erreur lors de l'inscription");
    }
  },
};

export default UserService;
