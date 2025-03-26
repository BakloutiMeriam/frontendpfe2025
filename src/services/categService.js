import axios from "axios";

const API_URL = "http://localhost:3000/api/categories";

// Configurer axios pour inclure les credentials
axios.defaults.withCredentials = true;

export const getToken = () => {
  return localStorage.getItem("token");
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Récupérer toutes les catégories
export const getCategoriesService = async () => {
  try {
    const response = await axios.get(`${API_URL}/listeCat`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Erreur lors de la récupération des catégories"
    );
  }
};

// Récupérer une catégorie par ID
export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/listeCatId/${id}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Erreur lors de la récupération de la catégorie"
    );
  }
};

// Créer une nouvelle catégorie (admin seulement)
export const createCategorieService = async (categoryData) => {
  try {
    const response = await axios.post(`${API_URL}/insertCat`, categoryData, {
      headers: authHeader(),
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Erreur lors de la création de la catégorie"
    );
  }
};

// Mettre à jour une catégorie (admin seulement)
export const updateCategorieService = async (id, categoryData) => {
  try {
    const response = await axios.put(
      `${API_URL}/updateCat/${id}`,
      categoryData,
      {
        headers: authHeader(),
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Erreur lors de la mise à jour de la catégorie"
    );
  }
};

// Supprimer une catégorie (admin seulement)
export const deleteCategorieService = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/deleteCat/${id}`, {
      headers: authHeader(),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Erreur lors de la suppression de la catégorie"
    );
  }
};
