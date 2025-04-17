// components/messages/HelpConversations.js
import React, { useState, useEffect, useContext } from "react";
import { getHelpConversations } from "../services/messageService";
import { AuthContext } from "../context/AuthContext";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

const HelpConversations = ({
  selectedConversation,
  setSelectedConversation,
  refreshTrigger,
  isAdmin,
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "unread", "resolved"
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);

        // Si c'est un admin, utiliser l'endpoint admin
        let response;
        if (isAdmin) {
          response = await getHelpConversations();
          setConversations(response.conversations || []);
        } else {
          const response = await getHelpConversations();
          if (response && response.conversations) {
            const helpConversations = response.conversations.filter(
              (conv) =>
                conv.lastMessage && conv.lastMessage.messageType === "help"
            );
            setConversations(helpConversations || []);
          } else {
            setConversations([]);
          }
        }

        setError("");
      } catch (err) {
        console.error("Erreur lors du chargement des conversations:", err);
        setError("Impossible de charger les conversations");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [refreshTrigger, isAdmin]);

  // Fonction pour formater la date relative
  const formatRelativeDate = (dateString) => {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: fr,
    });
  };

  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Filtrer les conversations selon le statut sélectionné
  const filteredConversations = conversations.filter((conversation) => {
    if (filter === "all") return true;
    return conversation.status === filter;
  });

  if (loading) {
    return (
      <div className="help-loading">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="help-error-message">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="help-empty-list">
        <div className="help-empty-icon">
          <i className="fas fa-inbox"></i>
        </div>
        <p className="help-empty-text">
          {isAdmin
            ? "Aucune demande d'aide à traiter"
            : "Vous n'avez pas encore envoyé de demande d'aide"}
        </p>
      </div>
    );
  }

  return (
    <div className="help-conversations">
      {/* Filtres pour admin */}
      {isAdmin && (
        <div className="help-filters">
          <button
            className={`help-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Toutes
          </button>
          <button
            className={`help-filter-btn ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Non lues
          </button>
          <button
            className={`help-filter-btn ${
              filter === "resolved" ? "active" : ""
            }`}
            onClick={() => setFilter("resolved")}
          >
            Résolues
          </button>
        </div>
      )}

      <div className="conversation-list">
        {filteredConversations.map((conversation) => {
          const isSelected =
            selectedConversation?.conversationId ===
            conversation.conversationId;
          const lastMessage = conversation.lastMessage;
          const sender = isAdmin
            ? conversation.sender
            : lastMessage.sender._id === user?._id
            ? { nom: "Vous", prenom: "" }
            : lastMessage.sender;

          return (
            <div
              key={conversation.conversationId}
              className={`conversation-item ${isSelected ? "active" : ""}`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="conversation-item-content">
                <div className="conversation-item-header">
                  <h6 className="conversation-item-title">
                    {lastMessage.subject}
                    {conversation.unreadCount > 0 && (
                      <span className="conversation-badge">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </h6>
                  <span
                    className={`conversation-status ${conversation.status}`}
                  >
                    {conversation.status === "unread"
                      ? "En attente"
                      : conversation.status === "read"
                      ? "lu"
                      : "Résolu"}
                  </span>
                </div>

                <p className="conversation-item-preview">
                  <span className="conversation-sender">
                    {sender.prenom} {sender.nom}:
                  </span>{" "}
                  {truncateText(lastMessage.content)}
                </p>

                <div className="conversation-item-meta">
                  <span className="conversation-time">
                    <i className="far fa-clock me-1"></i>
                    {formatRelativeDate(lastMessage.createdAt)}
                  </span>

                  {lastMessage.attachments &&
                    lastMessage.attachments.length > 0 && (
                      <span className="conversation-attachments">
                        <i className="fas fa-paperclip me-1"></i>
                        {lastMessage.attachments.length}
                      </span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HelpConversations;
