import React, { useState, useEffect } from "react";
import { getCategoriesService } from "../services/categService";
import "../styles/CategoryMenu.css"; // Gardez votre CSS existant
import {
  FaHome,
  FaHotel,
  FaBuilding,
  FaSwimmingPool,
  FaMountain,
} from "react-icons/fa";
import { BiWorld } from "react-icons/bi";

// Map d'icônes par défaut pour certaines catégories courantes
// Utile en cas d'erreur de chargement des icônes personnalisées
const defaultIcons = {
  appartement: FaBuilding,
  maison: FaHome,
  villa: FaHotel,
  piscine: FaSwimmingPool,
  montagne: FaMountain,
  // Ajoutez d'autres correspondances selon vos catégories courantes
};

const CategoryMenu = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesService();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setError("Format de données incorrect");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des catégories"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      onCategorySelect(null);
    } else {
      setActiveCategory(categoryId);
      onCategorySelect(categoryId);
    }
  };

  // Fonction pour déterminer quelle icône utiliser si l'image personnalisée ne charge pas
  const getFallbackIcon = (categoryName) => {
    const lowerCaseName = categoryName.toLowerCase();

    // Recherche par mots-clés dans le nom de la catégorie
    for (const [keyword, Icon] of Object.entries(defaultIcons)) {
      if (lowerCaseName.includes(keyword)) {
        return <Icon className="airbnb-category-icon" />;
      }
    }

    // Icône par défaut si aucune correspondance n'est trouvée
    return <BiWorld className="airbnb-category-icon" />;
  };

  if (loading) {
    return (
      <div className="airbnb-category-menu-loading">
        Chargement des catégories...
      </div>
    );
  }

  if (error) {
    return <div className="airbnb-category-menu-error">{error}</div>;
  }

  return (
    <div className="airbnb-category-menu">
      {/* Option "Tous" pour réinitialiser le filtre */}
      <button
        className={`airbnb-category-item ${
          activeCategory === null ? "active" : ""
        }`}
        onClick={() => handleCategoryClick(null)}
      >
        <FaHome className="airbnb-category-icon" />
        <span className="airbnb-category-label">Tous</span>
      </button>

      {categories.map((category) => (
        <button
          key={category._id}
          className={`airbnb-category-item ${
            activeCategory === category._id ? "active" : ""
          }`}
          onClick={() => handleCategoryClick(category._id)}
        >
          {/* Utilisation d'image avec fallback vers une icône React si l'image échoue */}
          <div className="airbnb-category-icon-wrapper">
            <img
              src={`/uploads/${category.icone}`}
              alt={category.nom}
              className="airbnb-category-custom-icon"
              onError={(e) => {
                // Remplacer l'image par une div qui contiendra notre icône de secours
                const parent = e.target.parentNode;
                parent.innerHTML = "";
                const iconElement = document.createElement("div");
                parent.appendChild(iconElement);

                // Ici, on utilise un peu de React dans la partie DOM
                // Ce n'est pas idéal mais cela fonctionne pour un fallback
                const fallbackIcon = getFallbackIcon(category.nom);
                if (typeof ReactDOM !== "undefined") {
                  // eslint-disable-next-line no-undef
                  ReactDOM.render(fallbackIcon, iconElement);
                } else {
                  iconElement.innerHTML =
                    '<i class="airbnb-category-icon fallback-icon"></i>';
                }
              }}
            />
          </div>
          <span className="airbnb-category-label">{category.nom}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryMenu;
