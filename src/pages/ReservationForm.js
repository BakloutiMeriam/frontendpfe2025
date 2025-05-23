import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { logementService } from "../services/LogementService";
import { AuthContext } from "../context/AuthContext";
import SimpleAvailabilityDisplay from "../components/SimpleAvailabilityDisplay";
import { reservationService } from "../services/reservationService.js";
import { Formik, Form, Field, ErrorMessage } from "formik";
import ContactModal from "../components/ContactModal";

import * as Yup from "yup";
import {
  FaCalendar,
  FaUser,
  FaHome,
  FaArrowLeft,
  FaCheck,
  FaMapMarkerAlt,
  FaEuroSign,
  FaInfoCircle,
  FaEnvelope,
  FaUsers,
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaRegCreditCard,
  FaPercentage,
  FaGift,
} from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/reservation-form.css";
import NavbarHome from "../components/NavbarHome.js";

const ReservationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const { user: authUser } = useContext(AuthContext);
  const [reservationDetails, setReservationDetails] = useState({
    dureeNuits: 0,
    prixTotal: 0,
  });
  const [datesIndisponibles, setDatesIndisponibles] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);

  // State pour le type de réservation
  const [typeReservation, setTypeReservation] = useState("nuit");

  useEffect(() => {
    const fetchLogementAndReservations = async () => {
      try {
        setLoading(true);

        // Chargement du logement
        const logementData = await logementService.getLogementById(id);
        if (!logementData || !logementData.disponible) {
          setError("Ce logement n'est pas disponible à la réservation.");
          setLoading(false);
          return;
        }
        setLogement(logementData);

        // Chargement des réservations
        try {
          const reservationsConfirmees =
            await reservationService.getAllReservationsConfirmee(id);

          if (reservationsConfirmees && Array.isArray(reservationsConfirmees)) {
            const datesBloquees = processDatesIndisponibles(
              reservationsConfirmees
            );
            setDatesIndisponibles(datesBloquees);
          } else {
            setDatesIndisponibles([]);
          }
        } catch (reservationError) {
          console.error("Error processing reservations:", reservationError);
          setDatesIndisponibles([]);
        }

        // Chargement utilisateur
        if (authUser) {
          setUser(authUser);
        }

        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement :", err);
        setError(
          `Impossible de charger les détails du logement : ${err.message}`
        );
        setLoading(false);
      }
    };

    fetchLogementAndReservations();
  }, [id, navigate, authUser, user]);

  // Fonction séparée pour le traitement des dates
  const processDatesIndisponibles = (reservations) => {
    const datesBloquees = new Set();

    reservations.forEach((reservation) => {
      try {
        // Création des dates avec le fuseau horaire local
        const dateDebutStr = reservation.dateDebut.split("T")[0]; // Prendre seulement YYYY-MM-DD
        const dateFinStr = reservation.dateFin.split("T")[0]; // Prendre seulement YYYY-MM-DD

        const dateDebut = new Date(dateDebutStr + "T00:00:00"); // Forcer l'heure locale à minuit
        const dateFin = new Date(dateFinStr + "T00:00:00"); // Forcer l'heure locale à minuit

        if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
          return;
        }

        const currentDate = new Date(dateDebut);

        while (currentDate <= dateFin) {
          // Formatage de la date en YYYY-MM-DD sans convertir en UTC
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentDate.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;

          datesBloquees.add(dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.error("Error processing reservation dates:", error);
      }
    });

    return Array.from(datesBloquees).sort();
  };

  // Fonction pour vérifier si un mois entier est disponible
  const estMoisDisponible = (year, month) => {
    const premiereDate = new Date(year, month - 1, 1);
    const derniereDate = new Date(year, month, 0); // Dernier jour du mois

    const currentDate = new Date(premiereDate);
    while (currentDate <= derniereDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (datesIndisponibles.includes(dateStr)) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  };

  // Fonction pour générer la liste des mois disponibles
  const getMoisDisponibles = () => {
    const moisDisponibles = [];
    const maintenant = new Date();
    const moisNoms = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    // Générer les 12 prochains mois
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        maintenant.getFullYear(),
        maintenant.getMonth() + i,
        1
      );
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (estMoisDisponible(year, month)) {
        moisDisponibles.push({
          value: `${year}-${month.toString().padStart(2, "0")}`,
          label: `${moisNoms[month - 1]} ${year}`,
          year: year,
          month: month,
        });
      }
    }

    return moisDisponibles;
  };

  // Fonction pour calculer le prix mensuel avec remise
  const calculerPrixMensuel = () => {
    const prixBase = logement.prix * 30; // Prix pour 30 nuits
    const remise = 0.3; // 30% de remise
    return Math.round(prixBase * (1 - remise));
  };

  const calculerNombreNuits = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const estDateIndisponible = (date) => {
    if (!date) return false;

    const dateStr =
      typeof date === "string"
        ? new Date(date).toISOString().split("T")[0]
        : date.toISOString().split("T")[0];

    return datesIndisponibles.includes(dateStr);
  };

  const periodeContientDatesIndisponibles = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return false;

    const debut = new Date(dateDebut);
    debut.setHours(0, 0, 0, 0);

    const fin = new Date(dateFin);
    fin.setHours(0, 0, 0, 0);

    const currentDate = new Date(debut);
    while (currentDate <= fin) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (datesIndisponibles.includes(dateStr)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return false;
  };

  // Schéma de validation adapté selon le type de réservation
  const getValidationSchema = () => {
    const baseSchema = {
      nombrePersonnes: Yup.number()
        .required("Le nombre de personnes est requis")
        .min(1, "Il doit y avoir au moins une personne")
        .integer("Le nombre doit être un entier"),
      message: Yup.string(),
      acceptTerms: Yup.boolean().oneOf(
        [true],
        "Vous devez accepter les conditions"
      ),
    };

    if (typeReservation === "nuit") {
      return Yup.object({
        ...baseSchema,
        dateDebut: Yup.date()
          .required("La date de début est requise")
          .min(new Date(), "La date doit être dans le futur")
          .test(
            "date-disponible",
            "Cette date est déjà réservée",
            function (value) {
              if (!value) return true;
              return !estDateIndisponible(value.toISOString().split("T")[0]);
            }
          ),
        dateFin: Yup.date()
          .required("La date de fin est requise")
          .min(
            Yup.ref("dateDebut"),
            "La date de fin doit être postérieure à la date de début"
          )
          .test(
            "date-disponible",
            "Cette date est déjà réservée",
            function (value) {
              if (!value) return true;
              return !estDateIndisponible(value.toISOString().split("T")[0]);
            }
          )
          .test(
            "periode-disponible",
            "Cette période contient des dates déjà réservées",
            function (value) {
              const { dateDebut } = this.parent;
              if (!dateDebut || !value) return true;
              return !periodeContientDatesIndisponibles(dateDebut, value);
            }
          ),
      });
    } else {
      return Yup.object({
        ...baseSchema,
        moisChoisi: Yup.string().required("Veuillez choisir un mois"),
      });
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let reservationData;
      let total;
      let nuits;

      if (typeReservation === "nuit") {
        // Logique existante pour les nuitées
        if (
          periodeContientDatesIndisponibles(values.dateDebut, values.dateFin)
        ) {
          setError("Cette période contient des dates déjà réservées.");
          setSubmitting(false);
          return;
        }

        nuits = calculerNombreNuits(values.dateDebut, values.dateFin);
        total = nuits * logement.prix;

        reservationData = {
          dateDebut: values.dateDebut,
          dateFin: values.dateFin,
          nombrePersonnes: values.nombrePersonnes,
          messageDemande: values.message,
          logement: id,
          prixTotal: total,
          typeReservation: "nuit",
        };
      } else {
        // Nouvelle logique pour les réservations mensuelles
        const [year, month] = values.moisChoisi.split("-");
        const dateDebut = new Date(parseInt(year), parseInt(month) - 1, 1);
        const dateFin = new Date(parseInt(year), parseInt(month), 0); // Dernier jour du mois

        nuits = dateFin.getDate(); // Nombre de jours dans le mois
        total = calculerPrixMensuel();

        reservationData = {
          dateDebut: dateDebut.toISOString().split("T")[0],
          dateFin: dateFin.toISOString().split("T")[0],
          nombrePersonnes: values.nombrePersonnes,
          messageDemande: values.message,
          logement: id,
          prixTotal: total,
          typeReservation: "mois",
        };
      }

      setReservationDetails({
        dureeNuits: nuits,
        prixTotal: total,
      });

      const response = await reservationService.createReservation(
        reservationData
      );
      setReservationId(response.reservation?._id || response.reservation?.id);

      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);

      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("déjà réservé")) {
          setError("Ce logement est déjà réservé pour ces dates.");
        } else if (errorMessage.includes("déjà une réservation active")) {
          setError(
            "Vous avez déjà une réservation pour ce logement à ces dates. Vérifiez votre liste de réservations."
          );
        } else {
          setError(
            `Erreur lors de la création de la réservation: ${errorMessage}`
          );
        }
      } else {
        setError(
          `Erreur lors de la création de la réservation: ${
            error.message || error
          }`
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formaterDatePourHTML = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const formatFrenchDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const aujourdhui = formaterDatePourHTML(new Date());

  if (loading)
    return (
      <div className="modern-loading">
        <div className="modern-spinner"></div>
        <p>Chargement des détails...</p>
      </div>
    );

  if (error)
    return (
      <div className="modern-error-container">
        <div className="modern-error">
          <FaExclamationTriangle className="modern-error-icon" />
          <p>{error}</p>
          <button className="modern-btn-outline" onClick={() => navigate(-1)}>
            Retour
          </button>
        </div>
      </div>
    );

  if (!logement)
    return (
      <div className="modern-error-container">
        <div className="modern-error">
          <FaInfoCircle className="modern-error-icon" />
          <h2>Données du logement non disponibles</h2>
          <button className="modern-btn-outline" onClick={() => navigate(-1)}>
            Retour
          </button>
        </div>
      </div>
    );

  const initialValues =
    typeReservation === "nuit"
      ? {
          dateDebut: "",
          dateFin: "",
          nombrePersonnes: 1,
          message: "",
          acceptTerms: false,
        }
      : {
          moisChoisi: "",
          nombrePersonnes: 1,
          message: "",
          acceptTerms: false,
        };

  const moisDisponibles =
    typeReservation === "mois" ? getMoisDisponibles() : [];

  return (
    <>
      <NavbarHome />
      <div className="modern-reservation-container">
        <div className="modern-back-nav">
          <button
            className="modern-back-btn"
            onClick={() => navigate(`/Public-logement-details/${id}`)}
          >
            <FaArrowLeft />
            <span>Retour aux détails</span>
          </button>
        </div>

        <div className="modern-layout">
          <div className="modern-property-preview">
            <div className="modern-property-card">
              <h1 className="modern-property-title">{logement.titre}</h1>

              <div className="modern-property-details">
                <p className="modern-property-location">
                  <FaMapMarkerAlt />
                  <span>
                    {logement.adresse?.ville || ""},{" "}
                    {logement.adresse?.pays || ""}
                  </span>
                </p>
              </div>

              {logement.photoprincipale && logement.photos.length > 0 ? (
                <div className="modern-property-image">
                  <img src={logement.photoprincipale} alt={logement.titre} />
                </div>
              ) : (
                <div className="modern-property-image modern-placeholder-image">
                  <FaHome className="modern-home-icon" />
                </div>
              )}

              <div className="modern-property-highlights">
                <div className="modern-highlight-item">
                  <FaHome className="modern-highlight-icon" />
                  <div>
                    <div className="modern-highlight-label">Type</div>
                    <div className="modern-highlight-value">
                      {logement.type || "Appartement"}
                    </div>
                  </div>
                </div>

                <div className="modern-highlight-item">
                  <FaEuroSign className="modern-highlight-icon" />
                  <div>
                    <div className="modern-highlight-label">Prix</div>
                    <div className="modern-highlight-value">
                      {typeReservation === "nuit"
                        ? `${logement.prix}€ par nuitée`
                        : `${calculerPrixMensuel()}€ par mois`}
                      {typeReservation === "mois" && (
                        <div className="modern-discount-badge">
                          <FaPercentage />
                          <span>-30% sur le tarif mensuel</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {datesIndisponibles.length > 0 && (
                <SimpleAvailabilityDisplay
                  datesIndisponibles={datesIndisponibles}
                />
              )}
            </div>
          </div>

          <div className="modern-booking-panel">
            <div className="modern-booking-form-container">
              <h2 className="modern-form-title">Réserver votre séjour</h2>

              {/* Sélecteur de type de réservation */}
              <div className="modern-booking-type-selector">
                <div className="modern-type-option">
                  <label
                    className={`modern-type-label ${
                      typeReservation === "nuit" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="typeReservation"
                      value="nuit"
                      checked={typeReservation === "nuit"}
                      onChange={(e) => setTypeReservation(e.target.value)}
                      className="modern-radio-input"
                    />
                    <div className="modern-type-content">
                      <div className="modern-type-header">
                        <FaCalendar className="modern-type-icon" />
                        <span className="modern-type-title">Par nuitée</span>
                      </div>
                      <span className="modern-type-description">
                        Réservation flexible par jour
                      </span>
                      <span className="modern-type-price">
                        {logement.prix}€ / nuit
                      </span>
                    </div>
                  </label>
                </div>

                <div className="modern-type-option">
                  <label
                    className={`modern-type-label ${
                      typeReservation === "mois" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="typeReservation"
                      value="mois"
                      checked={typeReservation === "mois"}
                      onChange={(e) => setTypeReservation(e.target.value)}
                      className="modern-radio-input"
                    />
                    <div className="modern-type-content">
                      <div className="modern-type-header">
                        <FaHome className="modern-type-icon monthly" />
                        <span className="modern-type-title">Par mois</span>
                        <span className="modern-discount-badge">
                          <FaGift />
                          -30%
                        </span>
                      </div>
                      <span className="modern-type-description">
                        Séjour longue durée avec remise
                      </span>
                      <span className="modern-type-price monthly">
                        {calculerPrixMensuel()}€ / mois
                        <small className="modern-original-price">
                          au lieu de {logement.prix * 30}€
                        </small>
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <Formik
                key={typeReservation} // Force re-render when type changes
                initialValues={initialValues}
                validationSchema={getValidationSchema()}
                onSubmit={handleSubmit}
              >
                {({ values, isSubmitting, errors, touched }) => {
                  let nuits = 0;
                  let total = 0;
                  let economie = 0;

                  if (
                    typeReservation === "nuit" &&
                    values.dateDebut &&
                    values.dateFin
                  ) {
                    nuits = calculerNombreNuits(
                      values.dateDebut,
                      values.dateFin
                    );
                    total = nuits * logement.prix;
                  } else if (typeReservation === "mois" && values.moisChoisi) {
                    const [year, month] = values.moisChoisi.split("-");
                    nuits = new Date(
                      parseInt(year),
                      parseInt(month),
                      0
                    ).getDate();
                    total = calculerPrixMensuel();
                    economie = nuits * logement.prix - total;
                  }

                  return (
                    <Form className="modern-form">
                      {/* Formulaire pour réservation par nuitée */}
                      {typeReservation === "nuit" && (
                        <>
                          <div className="modern-form-dates">
                            <div className="modern-form-group">
                              <label
                                htmlFor="dateDebut"
                                className="modern-label"
                              >
                                <FaCalendar className="modern-input-icon" />
                                Date d'arrivée
                              </label>
                              <Field
                                type="date"
                                id="dateDebut"
                                name="dateDebut"
                                min={aujourdhui}
                                className={`modern-input ${
                                  errors.dateDebut && touched.dateDebut
                                    ? "modern-input-error"
                                    : ""
                                }`}
                              />
                              <ErrorMessage
                                name="dateDebut"
                                component="div"
                                className="modern-error-message"
                              />
                            </div>

                            <div className="modern-form-group">
                              <label htmlFor="dateFin" className="modern-label">
                                <FaCalendar className="modern-input-icon" />
                                Date de départ
                              </label>
                              <Field
                                type="date"
                                id="dateFin"
                                name="dateFin"
                                min={values.dateDebut || aujourdhui}
                                className={`modern-input ${
                                  errors.dateFin && touched.dateFin
                                    ? "modern-input-error"
                                    : ""
                                }`}
                              />
                              <ErrorMessage
                                name="dateFin"
                                component="div"
                                className="modern-error-message"
                              />
                            </div>
                          </div>

                          {values.dateDebut && values.dateFin && (
                            <div className="modern-date-summary">
                              {values.dateDebut &&
                              values.dateFin &&
                              periodeContientDatesIndisponibles(
                                values.dateDebut,
                                values.dateFin
                              ) ? (
                                <div className="modern-date-warning">
                                  <FaExclamationTriangle className="modern-warning-icon" />
                                  <span>
                                    Cette période contient des dates déjà
                                    réservées
                                  </span>
                                </div>
                              ) : nuits > 0 ? (
                                <div className="modern-date-success">
                                  <FaCheck className="modern-success-icon" />
                                  <span>
                                    <strong>
                                      {nuits} nuit{nuits > 1 ? "s" : ""}
                                    </strong>
                                    , du {formatFrenchDate(values.dateDebut)} au{" "}
                                    {formatFrenchDate(values.dateFin)}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </>
                      )}

                      {/* Formulaire pour réservation mensuelle */}
                      {typeReservation === "mois" && (
                        <div className="modern-form-group">
                          <label htmlFor="moisChoisi" className="modern-label">
                            <FaCalendar className="modern-input-icon" />
                            Choisir le mois
                          </label>
                          {moisDisponibles.length > 0 ? (
                            <>
                              <Field
                                as="select"
                                id="moisChoisi"
                                name="moisChoisi"
                                className={`modern-input modern-select ${
                                  errors.moisChoisi && touched.moisChoisi
                                    ? "modern-input-error"
                                    : ""
                                }`}
                              >
                                <option value="">Sélectionnez un mois</option>
                                {moisDisponibles.map((mois) => (
                                  <option key={mois.value} value={mois.value}>
                                    {mois.label}
                                  </option>
                                ))}
                              </Field>

                              {values.moisChoisi && (
                                <div className="modern-monthly-summary">
                                  <div className="modern-summary-header">
                                    <FaCheck className="modern-success-icon" />
                                    <span>
                                      Mois entier sélectionné ({nuits} jours)
                                    </span>
                                  </div>
                                  <div className="modern-savings-highlight">
                                    <FaGift className="modern-gift-icon" />
                                    <span>
                                      Vous économisez{" "}
                                      <strong>{economie}€</strong> avec la
                                      réduction mensuelle !
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="modern-no-months-available">
                              <FaInfoCircle className="modern-info-icon" />
                              <div>
                                <p>
                                  <strong>Aucun mois entier disponible</strong>
                                </p>
                                <p>
                                  Certaines dates sont déjà réservées. Essayez
                                  la réservation par nuitée pour plus de
                                  flexibilité.
                                </p>
                              </div>
                            </div>
                          )}
                          <ErrorMessage
                            name="moisChoisi"
                            component="div"
                            className="modern-error-message"
                          />
                        </div>
                      )}

                      <div className="modern-form-group">
                        <label
                          htmlFor="nombrePersonnes"
                          className="modern-label"
                        >
                          <FaUsers className="modern-input-icon" />
                          Nombre de personnes
                        </label>
                        <Field
                          type="number"
                          id="nombrePersonnes"
                          name="nombrePersonnes"
                          min="1"
                          max="10"
                          className={`modern-input ${
                            errors.nombrePersonnes && touched.nombrePersonnes
                              ? "modern-input-error"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name="nombrePersonnes"
                          component="div"
                          className="modern-error-message"
                        />
                      </div>

                      <div className="modern-form-group">
                        <label htmlFor="message" className="modern-label">
                          <FaEnvelope className="modern-input-icon" />
                          Message au propriétaire (optionnel)
                        </label>
                        <Field
                          as="textarea"
                          id="message"
                          name="message"
                          rows="3"
                          placeholder="Présentez-vous et précisez le motif de votre séjour..."
                          className="modern-textarea"
                        />
                      </div>

                      {(nuits > 0 ||
                        (typeReservation === "mois" && values.moisChoisi)) && (
                        <div className="modern-booking-summary">
                          <h4 className="modern-summary-title">
                            Résumé de la réservation
                          </h4>
                          <div className="modern-summary-details">
                            <div className="modern-summary-row">
                              <span>
                                {typeReservation === "nuit"
                                  ? `${nuits} nuit${nuits > 1 ? "s" : ""}`
                                  : `1 mois (${nuits} jours)`}{" "}
                                × {logement.prix}€
                              </span>
                              <span>{logement.prix * nuits}€</span>
                            </div>

                            {typeReservation === "mois" && economie > 0 && (
                              <div className="modern-summary-row modern-discount-row">
                                <span>
                                  <FaPercentage className="modern-discount-icon" />
                                  Remise mensuelle (30%)
                                </span>
                                <span className="modern-discount-amount">
                                  -{economie}€
                                </span>
                              </div>
                            )}

                            <div className="modern-summary-divider"></div>
                            <div className="modern-summary-row modern-total-row">
                              <span>Total</span>
                              <span>{total}€</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="modern-form-group modern-checkbox-group">
                        <label className="modern-checkbox-label">
                          <Field
                            type="checkbox"
                            name="acceptTerms"
                            className="modern-checkbox"
                          />
                          <span className="modern-checkbox-custom"></span>
                          <span className="modern-checkbox-text">
                            J'accepte les conditions générales et la politique
                            de confidentialité
                          </span>
                        </label>
                        <ErrorMessage
                          name="acceptTerms"
                          component="div"
                          className="modern-error-message"
                        />
                      </div>

                      <button
                        type="submit"
                        className="modern-btn-primary"
                        disabled={
                          isSubmitting ||
                          periodeContientDatesIndisponibles(
                            values.dateDebut,
                            values.dateFin
                          )
                        }
                      >
                        {isSubmitting ? (
                          <span className="modern-btn-spinner" />
                        ) : (
                          <>
                            <FaCheck className="modern-btn-icon" />
                            Réserver maintenant
                          </>
                        )}
                      </button>

                      <div className="modern-info-panel">
                        <div className="modern-info-block">
                          <div className="modern-info-header">
                            <FaShieldAlt className="modern-info-icon" />
                            <h3>Réservation sécurisée</h3>
                          </div>
                          <p>
                            Votre paiement est protégé par notre garantie et
                            notre service client est disponible 24/7.
                          </p>
                        </div>

                        <div className="modern-info-block">
                          <div className="modern-info-header">
                            <FaClock className="modern-info-icon" />
                            <h3>Annulation flexible</h3>
                          </div>
                          <p>
                            Annulation gratuite jusqu'à 48h avant votre arrivée.
                            Conditions spécifiques affichées avant la
                            validation.
                          </p>
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
              <div className="modern-host-card">
                <h3 className="modern-section-title">À propos de l'hôte</h3>
                <div className="modern-host-info">
                  <div className="modern-host-avatar">
                    {logement.proprietaire?.url_img ? (
                      <img
                        src={logement.proprietaire.url_img}
                        alt={`${
                          logement.proprietaire?.prenom || "Propriétaire"
                        }`}
                        className="modern-host-image"
                      />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div className="modern-host-details">
                    <h4 className="modern-host-name">
                      {logement.proprietaire?.prenom || "Propriétaire"}
                    </h4>
                    <p className="modern-host-since">
                      Membre depuis{" "}
                      {logement.proprietaire?.createdAt
                        ? new Date(
                            logement.proprietaire.createdAt
                          ).toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Janvier 2023"}
                    </p>
                    <div className="modern-host-stat">
                      <FaShieldAlt className="modern-host-icon" />
                      <span>Identité vérifiée</span>
                    </div>
                    <button
                      className="modern-contact-btn"
                      onClick={() => setShowContactModal(true)}
                    >
                      <FaEnvelope className="modern-btn-icon" />
                      Contacter le propriétaire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de succès */}
        <Modal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton className="modern-modal-header">
            <Modal.Title>
              <FaCheck className="modern-modal-icon success" />
              Demande de réservation envoyée !
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modern-modal-body">
            <div className="modern-success-content">
              <p>
                Votre demande de réservation a été envoyée avec succès au
                propriétaire.
              </p>
              <div className="modern-reservation-details">
                <h5>Détails de votre demande :</h5>
                <ul>
                  <li>
                    <strong>Durée :</strong> {reservationDetails.dureeNuits}{" "}
                    {typeReservation === "nuit" ? "nuit" : "jour"}
                    {reservationDetails.dureeNuits > 1 ? "s" : ""}
                  </li>
                  <li>
                    <strong>Montant total :</strong>{" "}
                    {reservationDetails.prixTotal}€
                  </li>
                  <li>
                    <strong>Type de réservation :</strong>{" "}
                    {typeReservation === "nuit" ? "Par nuitée" : "Mensuelle"}
                  </li>
                </ul>
              </div>
              <p className="modern-next-step">
                Le propriétaire recevra votre demande et pourra l'accepter ou la
                refuser. Vous recevrez une notification par email dès qu'une
                décision sera prise.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="modern-modal-footer">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/Public-logement-details/${id}`)}
              className="modern-btn-outline"
            >
              Retour au logement
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/MesReservations")}
              className="modern-btn-primary"
            >
              Voir mes réservations
            </Button>
          </Modal.Footer>
        </Modal>

        <ContactModal
          show={showContactModal}
          handleClose={() => setShowContactModal(false)}
          proprietaire={logement?.proprietaire || {}}
          logement={logement}
          messageType="direct"
        />
      </div>
    </>
  );
};

export default ReservationForm;
