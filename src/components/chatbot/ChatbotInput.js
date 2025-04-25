// components/chatbot/ChatbotInput.js
/*import React, { useState } from "react";

const ChatbotInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="chatbot-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tapez votre message ici..."
        disabled={sending}
      />
      <button type="submit" disabled={!message.trim() || sending}>
        <i className="fa fa-paper-plane"></i>
      </button>
    </form>
  );
};

export default ChatbotInput;*/

import React, { useState } from "react";

const ChatbotInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="chatbot-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tapez votre message ici..."
        disabled={sending}
      />
      <button type="submit" disabled={sending || !message.trim()}>
        <i className="fas fa-paper-plane"></i>
      </button>
    </form>
  );
};

export default ChatbotInput;
