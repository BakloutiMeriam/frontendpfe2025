// src/pages/NotificationsPage.js
import { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../context/NotificationContext";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationService";
import "../styles/notifications.css";

const NotificationsPage = () => {
  const { notifications, fetchNotifications, fetchUnreadCount } =
    useContext(NotificationContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Supprimer une notification
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_user":
        return <i className="fas fa-user-plus notification-icon"></i>;
      case "new_owner":
        return <i className="fas fa-user-tie notification-icon"></i>;
      case "message":
        return <i className="fas fa-envelope notification-icon"></i>;
      case "help_request":
        return <i className="fas fa-question-circle notification-icon"></i>;
      case "new_reservation":
      case "reservation_update":
        return <i className="fas fa-calendar-check notification-icon"></i>;
      case "payment":
        return <i className="fas fa-credit-card notification-icon"></i>;
      case "system":
        return <i className="fas fa-cog notification-icon"></i>;
      default:
        return <i className="fas fa-bell notification-icon"></i>;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Mes notifications</h2>
        <button
          className="btn btn-outline-primary"
          onClick={handleMarkAllAsRead}
        >
          Marquer tout comme lu
        </button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  !notification.isRead ? "unread" : ""
                }`}
              >
                <div className="notification-icon-container">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-details">
                  <div className="notification-content">
                    {notification.content}
                  </div>
                  <div className="notification-date">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteNotification(notification._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications-message">
              <i className="fas fa-bell-slash"></i>
              <p>Vous n'avez aucune notification</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
