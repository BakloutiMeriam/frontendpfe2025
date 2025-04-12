import React, { useState } from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/simple-availability.css"; // Nous créerons ce fichier CSS simple

const SimpleAvailabilityDisplay = ({ datesIndisponibles }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthsToShow, setMonthsToShow] = useState(3); // Par défaut, afficher 3 mois

  // Fonction pour formater les noms des mois
  const getMonthName = (date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  // Fonction pour générer les jours du mois
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Fonction pour déterminer le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Fonction pour vérifier si une date est indisponible
  const isDateUnavailable = (dateToCheck) => {
    return datesIndisponibles.some((dateStr) => {
      // Formatage identique à celui utilisé dans processDatesIndisponibles
      const year = dateToCheck.getFullYear();
      const month = String(dateToCheck.getMonth() + 1).padStart(2, "0");
      const day = String(dateToCheck.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      return dateStr === formattedDate;
    });
  };

  // Générer les calendriers pour les mois affichés
  const renderCalendars = () => {
    const calendars = [];
    const today = new Date();

    for (let i = 0; i < monthsToShow; i++) {
      const monthDate = new Date(currentMonth);
      monthDate.setMonth(currentMonth.getMonth() + i);

      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);

      // Ajuster pour commencer la semaine le lundi (1) au lieu du dimanche (0)
      const startDay = firstDay === 0 ? 6 : firstDay - 1;

      // Noms des jours de la semaine
      const dayNames = ["L", "M", "M", "J", "V", "S", "D"];

      calendars.push(
        <div className="simple-month-calendar" key={`${year}-${month}`}>
          <h4 className="month-title">{getMonthName(monthDate)}</h4>
          <div className="days-header">
            {dayNames.map((day, index) => (
              <div className="day-name" key={index}>
                {day}
              </div>
            ))}
          </div>
          <div className="days-grid">
            {/* Espaces vides pour les jours avant le début du mois */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div className="empty-day" key={`empty-${index}`}></div>
            ))}

            {/* Jours du mois */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateObj = new Date(year, month, day);
              const isUnavailable = isDateUnavailable(dateObj);
              const isPastDate = dateObj < today;

              return (
                <div
                  className={`calendar-day ${
                    isUnavailable ? "unavailable" : ""
                  } ${isPastDate ? "past-date" : ""}`}
                  key={day}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return calendars;
  };

  // Navigation entre les mois
  const previousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const nextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Changer le nombre de mois affichés
  const handleMonthsToShowChange = (e) => {
    setMonthsToShow(parseInt(e.target.value));
  };

  return (
    <div className="simple-availability-container">
      <div className="availability-header">
        <h3 className="availability-title">
          <FaCalendar className="calendar-icon" /> Disponibilité
        </h3>
        <div className="calendar-controls">
          <button className="nav-btn" onClick={previousMonth}>
            <FaChevronLeft />
          </button>
          <select
            value={monthsToShow}
            onChange={handleMonthsToShowChange}
            className="months-selector"
          >
            <option value="1">1 mois</option>
            <option value="3">3 mois</option>
            <option value="6">6 mois</option>
            <option value="12">1 an</option>
          </select>
          <button className="nav-btn" onClick={nextMonth}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="calendars-container">{renderCalendars()}</div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>Indisponible</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleAvailabilityDisplay;
