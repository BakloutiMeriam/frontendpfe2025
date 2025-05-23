import React, { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";

const ChatbotMessages = ({
  messages,
  loading,
  error,
  onSendMessage,
  isNewConversation,
  inputFocused, // Nouveau prop pour savoir si le champ de saisie est focus
}) => {
  const messagesEndRef = useRef(null);

  // Pour debug - afficher les valeurs dans la console
  useEffect(() => {
    console.log("État des props dans ChatbotMessages:");
    console.log("isNewConversation:", isNewConversation);
    console.log("inputFocused:", inputFocused);
    console.log("messages.length:", messages?.length || 0);
    console.log("loading:", loading);
  }, [isNewConversation, inputFocused, messages, loading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fonction pour gérer la sélection d'une question suggérée
  const handleSelectQuestion = (question) => {
    if (onSendMessage) {
      onSendMessage(question);
    }
  };

  // Force affichage des questions au début
  const [forceShow, setForceShow] = useState(true);

  useEffect(() => {
    // Lorsque isNewConversation devient true, forcer l'affichage
    if (isNewConversation) {
      setForceShow(true);
    }

    // Si on reçoit des messages, ne plus forcer l'affichage
    if (messages && messages.length > 0) {
      setForceShow(false);
    }
  }, [isNewConversation, messages]);

  // Afficher les questions suggérées si:
  // 1. On force l'affichage (nouvelle conversation) OU
  // 2. C'est une nouvelle conversation sans messages ET l'utilisateur n'a pas encore cliqué sur le champ de saisie
  const shouldShowSuggestions =
    forceShow ||
    ((isNewConversation || (messages && messages.length === 0)) &&
      !inputFocused &&
      !loading);

  // Log pour débugger
  useEffect(() => {
    console.log(
      "shouldShowSuggestions:",
      shouldShowSuggestions,
      "forceShow:",
      forceShow
    );
  }, [shouldShowSuggestions, forceShow]);

  return (
    <div className="chatbot-messages-container">
      {/* Les questions suggérées apparaissent en haut quand les conditions sont remplies */}
      {shouldShowSuggestions && (
        <div className="suggested-questions-wrapper">
          <SuggestedQuestions onSelectQuestion={handleSelectQuestion} />
        </div>
      )}

      {/* Les messages sont affichés en dessous des suggestions */}
      <div className="messages-list">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {loading && (
          <div className="loading-indicator">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            Une erreur s'est produite. Veuillez réessayer.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatbotMessages;
