import React from "react";

const ChatbotHeader = ({ onClose, conversation, onToggleConversations }) => {
  return (
    <div className="chatbot-header">
      <div className="header-left">
        <button
          className="conversations-button"
          onClick={onToggleConversations}
        >
          <i className="fas fa-bars"></i>
        </button>
        <h3>Assistant Stayzy</h3>
      </div>
      <button className="close-button" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default ChatbotHeader;
