import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

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

  /*const loginWithFacebook = async (accessToken) => {
    try {
      console.log("Tentative de connexion avec Facebook...");
      const response = await authService.loginWithFacebook(accessToken);
      console.log("Réponse du serveur:", response);

      if (response && response.user && response.token) {
        const userData = {
          ...response.user,
          token: response.token,
        };

        setUser(userData);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.token);
        console.log("Utilisateur stocké dans le contexte:", userData);
        return userData;
      } else {
        throw new Error("Données d'utilisateur incomplètes");
      }
    } catch (error) {
      console.error("Erreur de connexion Facebook:", error);
      throw error;
    }
  };


  const loginWithGoogle = async (credential) => {
    try {
      const response = await authService.loginWithGoogle(credential);
      console.log("Réponse Google Auth:", response);

      if (response && response.user && response.token) {
        const userData = {
          ...response.user,
          token: response.token,
        };

        setUser(userData);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.token);
        console.log("Utilisateur Google stocké dans le contexte:", userData);
        return userData;
      } else {
        throw new Error("Données d'utilisateur Google incomplètes");
      }
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      throw error;
    }
  };*/
  const loginWithFacebook = async (accessToken) => {
    try {
      console.log("Tentative de connexion avec Facebook...");
      const response = await authService.loginWithFacebook(accessToken);
      console.log("Réponse du serveur:", response);

      if (response && response.user && response.token) {
        const userData = {
          ...response.user,
          token: response.token,
        };

        setUser(userData);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.token);
        console.log("Utilisateur stocké dans le contexte:", userData);
        return userData;
      } else {
        throw new Error("Données d'utilisateur incomplètes");
      }
    } catch (error) {
      console.error("Erreur de connexion Facebook:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await authService.loginWithGoogle(credential);
      console.log("Réponse Google Auth:", response);

      if (response && response.user && response.token) {
        const userData = {
          ...response.user,
          token: response.token,
        };

        setUser(userData);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.token);
        console.log("Utilisateur Google stocké dans le contexte:", userData);
        return userData;
      } else {
        throw new Error("Données d'utilisateur Google incomplètes");
      }
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      throw error;
    }
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
      value={{ user, login, logout, loginWithGoogle, loginWithFacebook }}
    >
      {children}
    </AuthContext.Provider>
  );
};
