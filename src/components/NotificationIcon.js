// src/components/NotificationIcon.js
import { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import { markAsRead } from "../services/notificationService";
import "../styles/notifications.css";
import { AuthContext } from "../context/AuthContext"; // Ajoutez ceci

const NotificationIcon = () => {
  const { notifications, unreadCount, fetchNotifications, fetchUnreadCount } =
    useContext(NotificationContext);
  const { user, token } = useContext(AuthContext); // Ajoutez ceci

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Formater la date de notification
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

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
    }
  };
  // Ajouter un useEffect pour rafraîchir les données quand l'utilisateur change
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, token]);
  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-icon-container" ref={dropdownRef}>
      <button
        className="notification-icon-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h6>Notifications</h6>
            <Link to="/notifications" onClick={() => setShowDropdown(false)}>
              Voir tout
            </Link>
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${
                    !notification.isRead ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="notification-content">
                    <p>{notification.content}</p>
                    <small>{formatDate(notification.createdAt)}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>Aucune notification</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
