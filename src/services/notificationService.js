// src/services/notificationService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/notifications";

// Fonction pour récupérer le token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Fonction pour construire l'en-tête Authorization
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtenir toutes les notifications de l'utilisateur
const getUserNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifs`, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    throw error;
  }
};

// Obtenir le nombre de notifications non lues
const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/unread-count`, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data.count;
  } catch (error) {
    console.error("Erreur lors du comptage des notifications non lues:", error);
    throw error;
  }
};

// Marquer une notification comme lue
const markAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${notificationId}/mark-read`,
      {},
      {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors du marquage de la notification:", error);
    throw error;
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async () => {
  try {
    const response = await axios.patch(
      `${API_URL}/mark-all-read`,
      {},
      {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors du marquage des notifications:", error);
    throw error;
  }
};

// Supprimer une notification
const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationId}`, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    throw error;
  }
};

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
