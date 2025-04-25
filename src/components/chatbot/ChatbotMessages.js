// components/chatbot/ChatbotMessages.js
/*import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

const ChatbotMessages = ({ messages, loading, error }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chatbot-messages-container">
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
  );
};

export default ChatbotMessages;*/
import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

const ChatbotMessages = ({ messages, loading, error }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chatbot-messages-container">
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
  );
};

export default ChatbotMessages;
