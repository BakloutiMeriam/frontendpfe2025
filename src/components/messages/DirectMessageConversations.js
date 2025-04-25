// components/messages/DirectMessageConversations.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { authHeader } from "../../services/messageService";

const DirectMessageConversations = ({
  selectedConversation,
  setSelectedConversation,
  refreshTrigger,
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"
  const { user } = useContext(AuthContext);

  const API_URL = "http://localhost:3000/api/messages"; // Ajustez selon votre configuration

  useEffect(() => {
    const fetchDirectMessageConversations = async () => {
      try {
        setLoading(true);

        // Endpoint spécifique pour les messages directs
        const response = await axios.get(`${API_URL}/direct/conversations`, {
          headers: {
            ...authHeader(),
          },
          withCredentials: true,
        });

        console.log("API Response:", response.data);

        if (response && response.data && response.data.conversations) {
          // Filtrer pour ne garder que les conversations de type message direct
          const directMessageConversations = response.data.conversations.filter(
            (conv) =>
              conv.lastMessage && conv.lastMessage.messageType === "direct"
          );
          console.log("Filtered conversations:", directMessageConversations);
          setConversations(directMessageConversations || []);
        } else {
          setConversations([]);
        }

        setError("");
      } catch (err) {
        console.error("Erreur lors du chargement des conversations:", err);
        setError("Impossible de charger les conversations de messages directs");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectMessageConversations();
  }, [refreshTrigger]);

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
    if (conversation.lastMessage) {
      return conversation.lastMessage.status === filter;
    }
    return false;
  });

  if (loading) {
    return (
      <div className="direct-message-loading text-center p-4">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="direct-message-empty-list text-center py-5">
        <div className="direct-message-empty-icon mb-3">
          <i className="fas fa-comments fa-3x text-muted"></i>
        </div>
        <p className="direct-message-empty-text text-muted">
          Vous n'avez pas encore de conversations de messages directs
        </p>
      </div>
    );
  }

  return (
    <div className="direct-message-conversations">
      {/* Filtres */}
      <div className="direct-message-filters mb-3">
        <div className="btn-group" role="group">
          <button
            className={`btn ${
              filter === "all" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilter("all")}
          >
            Toutes
          </button>
          <button
            className={`btn ${
              filter === "unread" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilter("unread")}
          >
            Non lues
          </button>
          <button
            className={`btn ${
              filter === "read" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilter("read")}
          >
            Lues
          </button>
        </div>
      </div>

      <div className="conversation-list">
        {filteredConversations.map((conversation) => {
          const isSelected =
            selectedConversation?.conversationId ===
            conversation.conversationId;
          const lastMessage = conversation.lastMessage;
          const otherParticipant = conversation.otherParty || {};

          // Déterminer qui est l'expéditeur du dernier message
          const senderName =
            lastMessage.sender === user?._id
              ? "Vous"
              : otherParticipant.prenom && otherParticipant.nom
              ? `${otherParticipant.prenom} ${otherParticipant.nom}`
              : "Contact";

          return (
            <div
              key={conversation.conversationId}
              className={`conversation-item p-3 mb-2 rounded ${
                isSelected ? "bg-light border border-primary" : "border"
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="conversation-item-content">
                <div className="conversation-item-header d-flex justify-content-between align-items-center mb-1">
                  <h6 className="conversation-item-title mb-0">
                    {otherParticipant
                      ? `${otherParticipant.prenom || ""} ${
                          otherParticipant.nom || ""
                        }`
                      : "Contact"}
                    {conversation.unreadCount > 0 && (
                      <span className="badge bg-primary rounded-pill ms-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </h6>
                  <span className="conversation-time small text-muted">
                    {formatRelativeDate(lastMessage.createdAt)}
                  </span>
                </div>

                <p className="conversation-item-preview text-muted mb-1">
                  <span
                    className={`${
                      lastMessage.sender === user?._id
                        ? "text-primary"
                        : "fw-bold"
                    }`}
                  >
                    {senderName}:
                  </span>{" "}
                  {truncateText(lastMessage.content)}
                </p>

                <div className="conversation-item-meta">
                  {lastMessage.subject && (
                    <span className="conversation-subject small fst-italic me-3">
                      <i className="fas fa-tag me-1"></i>
                      {truncateText(lastMessage.subject, 30)}
                    </span>
                  )}

                  {lastMessage.attachments &&
                    lastMessage.attachments.length > 0 && (
                      <span className="conversation-attachments small">
                        <i className="fas fa-paperclip me-1"></i>
                        {lastMessage.attachments.length} fichier(s)
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

export default DirectMessageConversations;
