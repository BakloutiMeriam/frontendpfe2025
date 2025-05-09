import axios from "axios";

const API_URL = "http://localhost:3000/api/avis";

// Fonction pour récupérer le token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Fonction pour construire l'en-tête Authorization
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Configuration commune pour les requêtes JSON
const jsonConfig = () => ({
  headers: {
    ...authHeader(),
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Configuration pour les requêtes FormData
const formDataConfig = () => ({
  headers: {
    ...authHeader(),
  },
  withCredentials: true,
});

// Mettre à jour un avis
const updateAvis = async (id, formData) => {
  try {
    // Log pour déboguer le contenu de FormData avant envoi
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axios.put(
      `${API_URL}/${id}`,
      formData,
      formDataConfig()
    );

    console.log("Réponse du serveur:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur détaillée:", error.response?.data || error.message);
    throw error;
  }
};

// Supprimer un avis
const deleteAvis = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, jsonConfig());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    throw error;
  }
};

export { updateAvis, deleteAvis };
