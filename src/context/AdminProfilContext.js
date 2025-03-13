import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminProfilContext = createContext();

export const AdminProfilProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Vérifier le token et récupérer les informations de l'utilisateur
      axios
        .get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Erreur de récupération de l'utilisateur:", error);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const login = async (email, mdp) => {
    try {
      const response = await axios.post("/api/auth/login", { email, mdp });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw new Error("Erreur de connexion");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AdminProfilContext.Provider value={{ user, login, logout }}>
      {children}
    </AdminProfilContext.Provider>
  );
};
