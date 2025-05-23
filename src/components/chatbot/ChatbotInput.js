import React, { useState } from "react";

const ChatbotInput = ({ onSendMessage, onFocusChange }) => {
  // Ajout du prop onFocusChange
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

  // Gestionnaires d'événements pour le focus et le blur
  const handleFocus = () => {
    if (onFocusChange) onFocusChange(true);
  };

  const handleBlur = () => {
    // Si vous souhaitez que les questions reviennent quand
    // l'utilisateur quitte le champ sans envoyer de message,
    // décommentez la ligne suivante:
    //if (onFocusChange) onFocusChange(false);
    // Pour l'instant, nous gardons le champ considéré comme "focusé"
    // même après blur pour que les questions ne réapparaissent pas
  };

  return (
    <form className="chatbot-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tapez votre message ici..."
        disabled={sending}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <button type="submit" disabled={sending || !message.trim()}>
        <i className="fas fa-paper-plane"></i>
      </button>
    </form>
  );
};

export default ChatbotInput;
