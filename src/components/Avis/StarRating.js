import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating }) => {
  if (!rating && rating !== 0) return <span>Pas encore d'avis</span>;

  // Convertir en nombre et limiter à 5
  const ratingValue = Math.min(Math.max(0, parseFloat(rating || 0)), 5);

  const stars = [];
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue - fullStars >= 0.5;

  // Ajouter les étoiles pleines
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
  }

  // Ajouter une demi-étoile si nécessaire
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star-icon half" />);
  }

  // Compléter avec des étoiles vides
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="star-icon empty" />);
  }

  return (
    <div className="star-rating-display">
      {stars} <span className="rating-value">({ratingValue.toFixed(1)})</span>
    </div>
  );
};

export default StarRating;
