// src/components/MessageIcon.js
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import * as messageService from "../services/messageService";
import "../styles/message-icon.css";

const MessageIcon = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUnread: 0,
    helpUnread: 0.0,
    infoUnread: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetcher les statistiques de messages non lus
  useEffect(() => {
    const fetchUnreadStats = async () => {
      try {
        setLoading(true);
        const response = await messageService.getUnreadStats();
        setStats(response);
        setLoading(false);
      } catch (error) {
        console.error("Erreur de chargement des messages:", error);
        setLoading(false);
      }
    };

    // Récupérer les stats immédiatement et configurer un rafraîchissement périodique
    if (user) {
      fetchUnreadStats();
      const interval = setInterval(fetchUnreadStats, 60000); // Rafraîchir toutes les minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (!user) return null;

  return (
    <li className="nav-item iconmessage-item">
      <div className="iconmessage-container">
        <button
          className="nav-link iconmessage-button"
          onClick={toggleDropdown}
          aria-expanded={showDropdown}
        >
          <i className="fas fa-envelope"></i>
          {stats.totalUnread > 0 && (
            <span className="notification-badge">{stats.totalUnread}</span>
          )}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h6>Messages</h6>
              <button
                onClick={() => setShowDropdown(false)}
                className="close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="notification-body">
              {loading ? (
                <div className="text-center p-3">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <>
                  {user.role === "proprietaire" && (
                    <Link
                      to="/messages/info"
                      className="notification-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="notification-icon-container info">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <div className="notification-details">
                        <p className="notification-content">
                          Messages informatifs
                        </p>
                        <p className="notification-text">
                          {stats.infoUnread > 0
                            ? `${stats.infoUnread} nouveau(x) message(s)`
                            : "Pas de nouveaux messages"}
                        </p>
                      </div>
                      {stats.infoUnread > 0 && (
                        <span className="badge bg-primary rounded-pill">
                          {stats.infoUnread}
                        </span>
                      )}
                    </Link>
                  )}

                  <Link
                    to="/help"
                    className="notification-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="notification-icon-container help">
                      <i className="fas fa-question-circle"></i>
                    </div>
                    <div className="notification-details">
                      <p className="notification-content">Centre d'aide</p>
                      <p className="notification-text">
                        {stats.helpUnread > 0
                          ? `${stats.helpUnread} nouveau(x) message(s)`
                          : "Pas de nouveaux messages d'aide"}
                      </p>
                    </div>
                    {stats.helpUnread > 0 && (
                      <span className="badge bg-primary rounded-pill">
                        {stats.helpUnread}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export default MessageIcon;
