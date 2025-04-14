import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Home.css"; // Le fichier CSS que nous allons créer

const SearchBar = ({ onSearch }) => {
  const [destination, setDestination] = useState("");
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("destination");

  const handleSubmit = (e) => {
    e.preventDefault();

    const searchParams = {
      destination,
      dateDebut,
      dateFin,
      prixMin: prixMin || undefined,
      prixMax: prixMax || undefined,
    };

    if (onSearch) {
      onSearch(searchParams);
    }

    setIsAdvancedSearchOpen(false);
  };

  const toggleAdvancedSearch = (tab) => {
    setActiveTab(tab);
    setIsAdvancedSearchOpen(true);
  };

  return (
    <div className="airbnb-search-container">
      <div className="airbnb-search-bar">
        <button
          className={`airbnb-search-item ${
            activeTab === "destination" ? "active" : ""
          }`}
          onClick={() => toggleAdvancedSearch("destination")}
        >
          <div className="airbnb-search-label">Destination</div>
          <div className="airbnb-search-value">
            {destination ? destination : "Où allez-vous ?"}
          </div>
        </button>

        <div className="airbnb-search-divider"></div>

        <button
          className={`airbnb-search-item ${
            activeTab === "dates" ? "active" : ""
          }`}
          onClick={() => toggleAdvancedSearch("dates")}
        >
          <div className="airbnb-search-label">Arrivée</div>
          <div className="airbnb-search-value">
            {dateDebut ? dateDebut.toLocaleDateString() : "Ajouter des dates"}
          </div>
        </button>

        <div className="airbnb-search-divider"></div>

        <button
          className={`airbnb-search-item ${
            activeTab === "dates" ? "active" : ""
          }`}
          onClick={() => toggleAdvancedSearch("dates")}
        >
          <div className="airbnb-search-label">Départ</div>
          <div className="airbnb-search-value">
            {dateFin ? dateFin.toLocaleDateString() : "Ajouter des dates"}
          </div>
        </button>

        <div className="airbnb-search-divider"></div>

        <button
          className={`airbnb-search-item ${
            activeTab === "price" ? "active" : ""
          }`}
          onClick={() => toggleAdvancedSearch("price")}
        >
          <div className="airbnb-search-label">Prix</div>
          <div className="airbnb-search-value">
            {prixMin || prixMax
              ? `${prixMin || 0}€ - ${prixMax || "∞"}€`
              : "Ajouter un budget"}
          </div>
        </button>

        <button className="airbnb-search-button" onClick={handleSubmit}>
          <FaSearch className="airbnb-search-icon" />
          <span>Rechercher</span>
        </button>
      </div>

      {isAdvancedSearchOpen && (
        <div className="airbnb-advanced-search">
          {activeTab === "destination" && (
            <div className="airbnb-search-panel">
              <h3>Où souhaitez-vous aller ?</h3>
              <div className="airbnb-destination-input">
                <FaSearch className="airbnb-input-icon" />
                <input
                  type="text"
                  placeholder="Rechercher une destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="airbnb-popular-destinations">
                <h4>Destinations populaires</h4>
                <div className="airbnb-destinations-grid">
                  {[
                    "Paris",
                    "Nice",
                    "Marseille",
                    "Lyon",
                    "Bordeaux",
                    "Strasbourg",
                  ].map((city) => (
                    <button
                      key={city}
                      className="airbnb-destination-chip"
                      onClick={() => setDestination(city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "dates" && (
            <div className="airbnb-search-panel">
              <h3>Quand souhaitez-vous séjourner ?</h3>
              <div className="airbnb-datepicker-container">
                <div className="airbnb-datepicker-group">
                  <label>Date d'arrivée</label>
                  <DatePicker
                    selected={dateDebut}
                    onChange={(date) => setDateDebut(date)}
                    selectsStart
                    startDate={dateDebut}
                    endDate={dateFin}
                    minDate={new Date()}
                    placeholderText="Date d'arrivée"
                    className="airbnb-datepicker"
                  />
                </div>
                <div className="airbnb-datepicker-group">
                  <label>Date de départ</label>
                  <DatePicker
                    selected={dateFin}
                    onChange={(date) => setDateFin(date)}
                    selectsEnd
                    startDate={dateDebut}
                    endDate={dateFin}
                    minDate={dateDebut || new Date()}
                    placeholderText="Date de départ"
                    className="airbnb-datepicker"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "price" && (
            <div className="airbnb-search-panel">
              <h3>Quel est votre budget ?</h3>
              <div className="airbnb-price-inputs">
                <div className="airbnb-price-group">
                  <label>Prix minimum (€)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={prixMin}
                    onChange={(e) => setPrixMin(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="airbnb-price-divider">-</div>
                <div className="airbnb-price-group">
                  <label>Prix maximum (€)</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={prixMax}
                    onChange={(e) => setPrixMax(e.target.value)}
                    min={prixMin || "0"}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="airbnb-search-panel-actions">
            <button
              onClick={() => setIsAdvancedSearchOpen(false)}
              className="airbnb-search-panel-close"
            >
              Fermer
            </button>
            <button
              onClick={handleSubmit}
              className="airbnb-search-panel-submit"
            >
              Rechercher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
