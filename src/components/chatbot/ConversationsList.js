import React from "react";
import { useChatbot } from "../../context/ChatbotContext";

const ConversationsList = ({ onSelectConversation, onClose }) => {
  const { conversations, loadConversation, startNewConversation } =
    useChatbot();

  // Fonction pour créer une nouvelle conversation vide
  const handleNewConversation = () => {
    startNewConversation("Coucou Stayzy ! "); // Créer une conversation vide
    onSelectConversation(); // Fermer la liste et afficher la conversation
  };

  // Fonction pour charger une conversation existante
  const handleSelectConversation = (conversationId) => {
    loadConversation(conversationId);
    onSelectConversation(); // Fermer la liste et afficher la conversation
  };

  return (
    <div className="conversations-list-container">
      <div className="conversations-header">
        <h3>Conversations</h3>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <button
        className="new-conversation-button"
        onClick={handleNewConversation}
      >
        <i className="fas fa-plus"></i> Nouvelle conversation
      </button>

      <h4>Conversations précédentes</h4>

      <div className="conversations-list">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            onClick={() => handleSelectConversation(conversation._id)}
            className="conversation-item"
          >
            <div className="conversation-date">
              {new Date(conversation.createdAt).toLocaleDateString()}
            </div>
            <div className="conversation-preview">
              {conversation.messages[0]?.content
                ? conversation.messages[0].content.substring(0, 30) + "..."
                : "Conversation vide"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsList;
