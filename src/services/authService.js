import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const login = async (email, mdp) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, mdp });

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

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (email, resetCode, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, {
    email,
    resetCode,
    newPassword,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  authHeader,
  getToken,
  logout,
  resetPassword,
  forgotPassword,
  login,
};
