// components/chatbot/ChatMessage.js
import React from "react";
const ChatMessage = ({ message }) => {
  // Vérifier plusieurs façons possibles d'identifier un message utilisateur
  const isUser =
    message.sender === "user" ||
    message.role === "user" ||
    message.from === "user" ||
    message.type === "user";

  return (
    <div className={`chat-message ${isUser ? "user-message" : "bot-message"}`}>
      <div className="message-avatar">
        {isUser ? (
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
        ) : (
          <div className="bot-avatar">
            <i className="fas fa-robot"></i>
          </div>
        )}
      </div>

      <div className="message-bubble">
        <div className="message-sender">
          {isUser ? "Vous" : "Assistant Stayzy"}
        </div>

        <div className="message-content">
          {message.html ? (
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          ) : (
            <div>{message.content}</div>
          )}
        </div>

        {message.timestamp && (
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
