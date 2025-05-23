import { useState, useEffect } from "react";
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
  const [isNewConversation, setIsNewConversation] = useState(true); // Commencer avec true
  const [inputFocused, setInputFocused] = useState(false); // Nouvel état pour suivre le focus

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    // Réinitialiser l'état lorsque le chatbot est ouvert
    if (!isOpen) {
      setInputFocused(false);
      if (
        !currentConversation ||
        !currentConversation.messages ||
        currentConversation.messages.length === 0
      ) {
        setIsNewConversation(true);
      }
    }
  };

  const toggleConversationsList = () => {
    setShowConversations(!showConversations);
  };

  // Si l'utilisateur a des conversations mais aucune n'est sélectionnée, charger la plus récente
  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      loadConversation(conversations[0]._id);
      setIsNewConversation(false);
    } else if (!currentConversation) {
      // Si pas de conversation du tout, c'est forcément une nouvelle
      setIsNewConversation(true);
      setInputFocused(false); // S'assurer que les questions s'affichent pour une nouvelle conversation
    }
  }, [conversations, currentConversation, loadConversation]);

  // Ajout d'un nouvel effet pour surveiller le changement de conversation
  useEffect(() => {
    console.log("Conversation changée!");
    // Si c'est une nouvelle conversation sans messages, réinitialiser l'état du focus
    if (
      !currentConversation ||
      !currentConversation.messages ||
      currentConversation.messages.length === 0
    ) {
      console.log("Réinitialisation du focus pour nouvelle conversation");
      setInputFocused(false);
      setIsNewConversation(true);
    }
  }, [currentConversation]);

  const handleSendMessage = (message) => {
    if (currentConversation) {
      setIsNewConversation(false); // Une fois qu'un message est envoyé, ce n'est plus une nouvelle conversation
      return sendMessage(currentConversation._id, message);
    } else {
      const promise = startNewConversation(message);
      setIsNewConversation(false); // Une fois qu'un message est envoyé, ce n'est plus une nouvelle conversation
      return promise;
    }
  };

  const handleNewConversation = () => {
    // Créer une nouvelle conversation vide
    startNewConversation("");
    setIsNewConversation(true);
    setShowConversations(false);
    setInputFocused(false); // Réinitialiser l'état de focus pour montrer les questions
  };

  // Fonction pour gérer les changements de focus du champ de saisie
  const handleInputFocusChange = (isFocused) => {
    console.log("Focus change:", isFocused);
    setInputFocused(isFocused);
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
              onSelectConversation={() => {
                setShowConversations(false);
                // Réinitialiser l'état pour une nouvelle sélection
                setInputFocused(false);
              }}
              onClose={() => setShowConversations(false)}
              onNewConversation={handleNewConversation}
            />
          ) : (
            <>
              <ChatbotHeader
                onClose={toggleChatbot}
                conversation={currentConversation}
                onToggleConversations={toggleConversationsList}
                onNewConversation={handleNewConversation}
              />
              <ChatbotMessages
                messages={currentConversation?.messages || []}
                loading={loading}
                error={error}
                onSendMessage={handleSendMessage}
                isNewConversation={isNewConversation}
                inputFocused={inputFocused} // Passer l'état du focus
              />
              <ChatbotInput
                onSendMessage={handleSendMessage}
                onFocusChange={handleInputFocusChange} // Passer la fonction de changement de focus
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotContainer;
