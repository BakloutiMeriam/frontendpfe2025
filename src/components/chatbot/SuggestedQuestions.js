import React from "react";

const SuggestedQuestions = ({ onSelectQuestion }) => {
  // Liste des questions fréquentes
  const suggestedQuestions = [
    "Comment fonctionne le processus de réservation?",
    "Comment puis-je contacter un propriétaire?",
    "Quelle est la politique d'annulation?",
    "Comment modifier ma réservation?",
    "Comment laisser un avis?",
  ];

  return (
    <div className="suggested-questions">
      <h3 className="suggested-title">Questions fréquentes</h3>
      <div className="questions-container">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            className="question-button"
            onClick={() => onSelectQuestion(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
