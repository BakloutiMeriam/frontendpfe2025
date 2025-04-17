// src/context/NotificationContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import {
  getUserNotifications,
  getUnreadCount,
} from "../services/notificationService";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Initialiser le socket et charger les notifications au montage
  useEffect(() => {
    // Nettoyer d'abord toute connexion existante
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    if (user && token) {
      console.log("Initialisation du socket avec token:", token);

      // Établir une nouvelle connexion socket
      const newSocket = io("http://localhost:3000", {
        auth: {
          token: token,
        },
      });

      setSocket(newSocket);

      // Charger les notifications initiales
      fetchNotifications();
      fetchUnreadCount();

      // Écouter les nouvelles notifications
      newSocket.on("new_notification", (notification) => {
        console.log("Nouvelle notification reçue:", notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // Écouter les notifications non lues à la connexion
      newSocket.on("unread_notifications", (notifs) => {
        console.log("Notifications non lues récupérées:", notifs);
        setNotifications((prev) => [...notifs, ...prev]);
        fetchUnreadCount(); // Actualiser le compteur
      });
      // Gérer les erreurs de connexion socket
      newSocket.on("connect_error", (error) => {
        console.error("Erreur de connexion socket:", error);
      });

      // Nettoyer à la déconnexion
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Si pas d'utilisateur, vider les notifications
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, token]);
  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    if (!user || !token) return;
    try {
      const { data } = await getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  // Fonction pour récupérer le nombre de notifications non lues
  const fetchUnreadCount = async () => {
    if (!user || !token) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Erreur lors du chargement du nombre de notifications:",
        error
      );
    }
  };

  // Valeur du contexte
  const value = {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
