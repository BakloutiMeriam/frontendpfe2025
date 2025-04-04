import React, { useState, useEffect } from "react";
import { getCategoriesService } from "../services/categService";
import "../styles/CategoryMenu.css";
import { FaHome } from "react-icons/fa";

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
    // Si on clique sur la catégorie déjà active, on désactive le filtre
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      onCategorySelect(null); // Réinitialiser le filtre
    } else {
      setActiveCategory(categoryId);
      onCategorySelect(categoryId); // Filtrer par cette catégorie
    }
  };

  if (loading) {
    return (
      <div className="category-menu-loading">Chargement des catégories...</div>
    );
  }

  if (error) {
    return <div className="category-menu-error">{error}</div>;
  }

  return (
    <div className="category-menu-container">
      <div className="category-menu">
        {/* Option "Tous" pour réinitialiser le filtre */}
        <div
          className={`category-item ${activeCategory === null ? "active" : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          <div className="category-icon-container">
            <FaHome className="category-icon" />
          </div>
          <span className="category-name">Tous</span>
        </div>

        {categories.map((category) => (
          <div
            key={category._id}
            className={`category-item ${
              activeCategory === category._id ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category._id)}
          >
            <div className="category-icon-container">
              <img
                src={`/uploads/${category.icone}`}
                alt={category.nom}
                className="category-custom-icon"
                onError={(e) => {
                  e.target.src = "/uploads/default-categorie.png";
                }}
              />
            </div>
            <span className="category-name">{category.nom}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;
