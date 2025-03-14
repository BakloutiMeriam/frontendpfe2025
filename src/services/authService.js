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

/*export const loginWithFacebook = async (accessToken) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/facebook-login",
      { accessToken }
    );

    // Si la réponse est un objet contenant success et user
    if (response.data && response.data.success && response.data.user) {
      return {
        user: response.data.user,
        token: response.data.token,
      };
    }
    // Si la réponse est directement l'utilisateur avec _id
    else if (response.data && response.data._id) {
      return response.data;
    }

    console.error("Format de réponse inattendu:", response.data);
    throw new Error("Format de réponse incorrect du serveur");
  } catch (error) {
    console.error("Erreur complète:", error);
    throw error.response?.data || error;
  }
};

export const loginWithGoogle = async (token) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/googleAuth",
      { token }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};*/
export const loginWithFacebook = async (accessToken) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/facebook-login",
      { accessToken }
    );

    if (response.data && response.data.success && response.data.user) {
      return {
        user: response.data.user,
        token: response.data.token,
      };
    } else if (response.data && response.data._id) {
      return response.data;
    }

    console.error("Format de réponse inattendu:", response.data);
    throw new Error("Format de réponse incorrect du serveur");
  } catch (error) {
    console.error("Erreur complète:", error);
    throw error.response?.data || error;
  }
};

export const loginWithGoogle = async (token) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/googleAuth",
      { token }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  authHeader,
  getToken,
  logout,
  resetPassword,
  forgotPassword,
  login,
  loginWithFacebook,
  loginWithGoogle,
};
