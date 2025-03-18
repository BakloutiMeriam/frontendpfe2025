import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading] = useState(true);

  // Fonction pour enregistrer les données utilisateur dans le stockage local
  const saveUserToStorage = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const login = async (email, mdp) => {
    try {
      const userData = await authService.login(email, mdp);
      if (userData) {
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      throw error;
    }
  };
  // Fonction de connexion avec Facebook
  const loginWithFacebook = async (accessToken) => {
    try {
      console.log("Tentative de connexion avec Facebook...");
      const response = await authService.loginWithFacebook(accessToken);
      console.log("Réponse du serveur:", response);

      if (response && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        saveUserToStorage(response.user, response.token);
        console.log(
          "Utilisateur Facebook stocké dans le contexte:",
          response.user
        );
        return response;
      } else {
        throw new Error("Données d'utilisateur Facebook incomplètes");
      }
    } catch (error) {
      console.error("Erreur de connexion Facebook:", error);
      throw error;
    }
  };

  // Fonction de connexion avec Google
  const loginWithGoogle = async (credential) => {
    try {
      const response = await authService.loginWithGoogle(credential);
      console.log("Réponse Google Auth:", response);

      if (response && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        saveUserToStorage(response.user, response.token);
        console.log(
          "Utilisateur Google stocké dans le contexte:",
          response.user
        );
        return response;
      } else {
        throw new Error("Données d'utilisateur Google incomplètes");
      }
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      throw error;
    }
  };

  // Fonction pour mettre à jour les informations utilisateur après la complétion du profil
  const updateUserAfterProfileCompletion = (updatedUserData, newToken) => {
    console.log("Mise à jour du profil utilisateur:", updatedUserData);

    if (updatedUserData) {
      const updatedUser = {
        ...updatedUserData,
        needsProfileCompletion: false,
      };

      setUser(updatedUser);

      // Mise à jour du token si fourni
      if (newToken) {
        setToken(newToken);
        saveUserToStorage(updatedUser, newToken);
      } else {
        // Sinon, conserver le token actuel
        saveUserToStorage(updatedUser, token);
      }

      return updatedUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Erreur de parsing du stockage local :", error);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithFacebook,
        loginWithGoogle,
        updateUserAfterProfileCompletion,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
