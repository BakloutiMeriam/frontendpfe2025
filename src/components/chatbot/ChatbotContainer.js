// components/chatbot/ChatbotContainer.js (modifié)
/*import React, { useState, useEffect } from "react";
import { useChatbot } from "../../context/ChatbotContext";
import ChatbotMessages from "./ChatbotMessages";
import ChatbotInput from "./ChatbotInput";
import ChatbotHeader from "./ChatbotHeader";
import ConversationsList from "./ConversationsList"; // Importez le nouveau composant
import "../../styles/chatbot.css";

const ChatbotContainer = () => {
  const {
    currentConversation,
    loading,
    error,
    conversations,
    loadConversation,
    startNewConversation,
    sendMessage,
  } = useChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false); // État pour afficher/masquer la liste des conversations

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const toggleConversationsList = () => {
    setShowConversations(!showConversations);
  };

  // Si l'utilisateur a des conversations mais aucune n'est sélectionnée, charger la plus récente
  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      loadConversation(conversations[0]._id);
    }
  }, [conversations, currentConversation, loadConversation]);

  const handleSendMessage = (message) => {
    if (currentConversation) {
      return sendMessage(currentConversation._id, message);
    } else {
      return startNewConversation(message);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : "closed"}`}>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChatbot}>
          <i className="fa fa-comments"></i>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <ChatbotHeader
            onClose={toggleChatbot}
            conversation={currentConversation}
            onToggleConversations={toggleConversationsList} // Passez la fonction pour afficher les conversations
          />

          {showConversations ? (
            <ConversationsList onSelect={() => setShowConversations(false)} />
          ) : (
            <>
              <ChatbotMessages
                messages={currentConversation?.messages || []}
                loading={loading}
                error={error}
              />
              <ChatbotInput onSendMessage={handleSendMessage} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotContainer;*/
import React, { useState, useEffect } from "react";
import { useChatbot } from "../../context/ChatbotContext";
import ChatbotMessages from "./ChatbotMessages";
import ChatbotInput from "./ChatbotInput";
import ChatbotHeader from "./ChatbotHeader";
import ConversationsList from "./ConversationsList";
import "../../styles/chatbot.css";

const ChatbotContainer = () => {
  const {
    currentConversation,
    loading,
    error,
    conversations,
    loadConversation,
    startNewConversation,
    sendMessage,
  } = useChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const toggleConversationsList = () => {
    setShowConversations(!showConversations);
  };

  // Si l'utilisateur a des conversations mais aucune n'est sélectionnée, charger la plus récente
  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      loadConversation(conversations[0]._id);
    }
  }, [conversations, currentConversation, loadConversation]);

  const handleSendMessage = (message) => {
    if (currentConversation) {
      return sendMessage(currentConversation._id, message);
    } else {
      return startNewConversation(message);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={toggleChatbot}>
          <i className="fas fa-comment"></i>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          {showConversations ? (
            <ConversationsList
              onSelectConversation={() => setShowConversations(false)}
              onClose={() => setShowConversations(false)}
            />
          ) : (
            <>
              <ChatbotHeader
                onClose={toggleChatbot}
                conversation={currentConversation}
                onToggleConversations={toggleConversationsList}
              />
              <ChatbotMessages
                messages={currentConversation?.messages || []}
                loading={loading}
                error={error}
              />
              <ChatbotInput onSendMessage={handleSendMessage} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotContainer;
