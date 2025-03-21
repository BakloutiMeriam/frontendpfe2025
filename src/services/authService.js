import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

/*export const login = async (email, mdp) => {
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
};*/
export const login = async (email, mdp) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, mdp });
    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    // Capture spécifiquement l'erreur 403 des propriétaires en attente d'approbation
    if (error.response && error.response.status === 403) {
      // Retourner les données d'erreur plutôt que de lancer une exception
      return {
        approvalStatus: "pending",
        role: "proprietaire",
        message: error.response.data.message,
        isApproved: false,
      };
    }
    throw new Error(error.response?.data?.message || "Erreur de connexion");
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
};*/

// Dans authService.js

export const loginWithFacebook = async (accessToken) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/facebook-login",
      { accessToken }
    );

    // Vérifier si c'est un nouvel utilisateur
    const isNew = !localStorage.getItem(
      `fb_user_${response.data.user?._id || response.data._id}`
    );

    // Si c'est un utilisateur existant, marquer qu'il a déjà été connecté
    if (!isNew && response.data.user) {
      localStorage.setItem(`fb_user_${response.data.user._id}`, "true");
    } else if (!isNew && response.data._id) {
      localStorage.setItem(`fb_user_${response.data._id}`, "true");
    }

    // Ajouter le flag isNewUser à la réponse
    const userData = response.data.user || response.data;
    return {
      user: { ...userData, isNewUser: isNew },
      token: response.data.token,
    };
  } catch (error) {
    console.error("Erreur complète:", error);
    throw error.response?.data || error;
  }
};

// Faire de même pour Google
export const loginWithGoogle = async (token) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/googleAuth",
      { token }
    );

    // Vérifier si c'est un nouvel utilisateur
    const isNew = !localStorage.getItem(
      `google_user_${response.data.user?._id || response.data._id}`
    );

    // Si c'est un utilisateur existant, marquer qu'il a déjà été connecté
    if (!isNew && response.data.user) {
      localStorage.setItem(`google_user_${response.data.user._id}`, "true");
    } else if (!isNew && response.data._id) {
      localStorage.setItem(`google_user_${response.data._id}`, "true");
    }

    // Ajouter le flag isNewUser à la réponse
    const userData = response.data.user || response.data;
    return {
      user: { ...userData, isNewUser: isNew },
      token: response.data.token,
    };
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
