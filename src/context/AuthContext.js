import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Correction ici : créez un état pour le token

  const login = async (email, mdp) => {
    try {
      const userData = await authService.login(email, mdp);
      if (userData) {
        setUser(userData);
        setToken(userData.token); // Utilisation de la fonction setToken pour mettre à jour le token
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null); // Réinitialisation de l'état du token
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken); // Réinitialisation du token à partir du localStorage
      } catch (error) {
        console.error("Erreur de parsing du stockage local :", error);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {" "}
      {/* Ajoutez "token" dans le provider */}
      {children}
    </AuthContext.Provider>
  );
};
