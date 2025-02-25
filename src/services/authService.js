import axios from "axios";

const API_URL = "http://localhost:3000/api/auth/login";

const login = async (email, mdp) => {
  try {
    const response = await axios.post(API_URL, { email, mdp });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Une erreur est survenue. Veuillez réessayer.");
    }
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getToken = () => {
  return localStorage.getItem("token");
};

export default { login, logout, getToken };
