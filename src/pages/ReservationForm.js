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
  FaStar,
  FaRegCreditCard,
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

  const validationSchema = Yup.object({
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
    nombrePersonnes: Yup.number()
      .required("Le nombre de personnes est requis")
      .min(1, "Il doit y avoir au moins une personne")
      .integer("Le nombre doit être un entier"),
    message: Yup.string(),
    acceptTerms: Yup.boolean().oneOf(
      [true],
      "Vous devez accepter les conditions"
    ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (periodeContientDatesIndisponibles(values.dateDebut, values.dateFin)) {
        setError("Cette période contient des dates déjà réservées.");
        setSubmitting(false);
        return;
      }

      const nuits = calculerNombreNuits(values.dateDebut, values.dateFin);
      const total = nuits * logement.prix;

      setReservationDetails({
        dureeNuits: nuits,
        prixTotal: total,
      });

      const reservationData = {
        dateDebut: values.dateDebut,
        dateFin: values.dateFin,
        nombrePersonnes: values.nombrePersonnes,
        messageDemande: values.message,
        logement: id,
        prixTotal: total,
      };

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

  const initialValues = {
    dateDebut: "",
    dateFin: "",
    nombrePersonnes: 1,
    message: "",
    acceptTerms: false,
  };

  // Formatage des dates indisponibles pour affichage
  /*const formatterDatesIndisponibles = () => {
    if (datesIndisponibles.length === 0) return [];

    return datesIndisponibles.slice(0, 5).map((date) => {
      return new Date(date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    });
  };*/

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
                <div className="modern-property-rating">
                  <FaStar className="modern-star-icon" />
                  <span>4.9</span>
                  <span className="modern-reviews-count">(24 avis)</span>
                </div>
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
                  <FaUsers className="modern-highlight-icon" />
                  <div>
                    <div className="modern-highlight-label">Capacité</div>
                    <div className="modern-highlight-value">
                      {logement.nombrePersonnes || "2"} personnes
                    </div>
                  </div>
                </div>

                <div className="modern-highlight-item">
                  <FaEuroSign className="modern-highlight-icon" />
                  <div>
                    <div className="modern-highlight-label">Prix</div>
                    <div className="modern-highlight-value">
                      {logement.prix} par nuitée
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

            <div className="modern-host-card">
              <h3 className="modern-section-title">À propos de l'hôte</h3>
              <div className="modern-host-info">
                <div className="modern-host-avatar">
                  <FaUser />
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
                    <FaStar className="modern-host-icon" />
                    <span>Note moyenne: 4.8</span>
                  </div>
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

          <div className="modern-booking-panel">
            <div className="modern-booking-form-container">
              <h2 className="modern-form-title">Réserver votre séjour</h2>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, isSubmitting, errors, touched }) => {
                  const nuits = calculerNombreNuits(
                    values.dateDebut,
                    values.dateFin
                  );
                  const total = nuits * logement.prix;

                  return (
                    <Form className="modern-form">
                      <div className="modern-form-dates">
                        <div className="modern-form-group">
                          <label htmlFor="dateDebut">
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
                          <label htmlFor="dateFin">
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
                                Cette période contient des dates déjà réservées
                              </span>
                            </div>
                          ) : nuits > 0 ? (
                            <div className="modern-date-success">
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

                      <div className="modern-form-group">
                        <label htmlFor="nombrePersonnes">
                          <FaUsers className="modern-input-icon" />
                          Voyageurs
                        </label>
                        <Field
                          type="number"
                          id="nombrePersonnes"
                          name="nombrePersonnes"
                          min="1"
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
                        <label htmlFor="message">
                          <FaEnvelope className="modern-input-icon" />
                          Message au propriétaire (facultatif)
                        </label>
                        <Field
                          as="textarea"
                          id="message"
                          name="message"
                          rows="3"
                          className="modern-textarea"
                          placeholder="Questions spécifiques ou informations à communiquer..."
                        />
                      </div>

                      {values.dateDebut && values.dateFin && nuits > 0 && (
                        <div className="modern-price-summary">
                          <div className="modern-price-row">
                            <span>
                              {logement.prix}€ × {nuits} nuit
                              {nuits > 1 ? "s" : ""}
                            </span>
                            <span>{total}€</span>
                          </div>
                          <div className="modern-price-row">
                            <span>Frais de service</span>
                            <span>{Math.round(total * 0.12)}€</span>
                          </div>
                          <div className="modern-price-row">
                            <span>Taxes de séjour</span>
                            <span>{Math.round(total * 0.03)}€</span>
                          </div>
                          <div className="modern-price-total">
                            <span>Total</span>
                            <span>{Math.round(total * 1.15)}€</span>
                          </div>
                        </div>
                      )}

                      <div className="modern-form-group modern-terms-group">
                        <div className="modern-checkbox-container">
                          <Field
                            type="checkbox"
                            id="acceptTerms"
                            name="acceptTerms"
                            className="modern-checkbox"
                          />
                          <label
                            htmlFor="acceptTerms"
                            className="modern-checkbox-label"
                          >
                            J'accepte les conditions de réservation et la
                            politique d'annulation
                          </label>
                        </div>
                        <ErrorMessage
                          name="acceptTerms"
                          component="div"
                          className="modern-error-message"
                        />
                      </div>

                      <div className="modern-payment-info">
                        <FaRegCreditCard className="modern-payment-icon" />
                        <p>
                          Le paiement sera traité après confirmation du
                          propriétaire.
                        </p>
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
                    </Form>
                  );
                }}
              </Formik>
            </div>

            <div className="modern-info-panel">
              <div className="modern-info-block">
                <div className="modern-info-header">
                  <FaShieldAlt className="modern-info-icon" />
                  <h3>Réservation sécurisée</h3>
                </div>
                <p>
                  Votre paiement est protégé par notre garantie et notre service
                  client est disponible 24/7.
                </p>
              </div>

              <div className="modern-info-block">
                <div className="modern-info-header">
                  <FaClock className="modern-info-icon" />
                  <h3>Annulation flexible</h3>
                </div>
                <p>
                  Annulation gratuite jusqu'à 48h avant votre arrivée.
                  Conditions spécifiques affichées avant la validation.
                </p>
              </div>
            </div>
          </div>
        </div>
        <ContactModal
          show={showContactModal}
          handleClose={() => setShowContactModal(false)}
          proprietaire={logement.proprietaire || {}}
          messageType="direct"
        />
        <Modal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          centered
          className="modern-modal"
        >
          <Modal.Header closeButton className="modern-modal-header">
            <Modal.Title>
              <FaCheck className="modern-modal-icon success" />
              Réservation confirmée
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modern-modal-body">
            <div className="modern-success-animation">
              <svg
                className="modern-checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  className="modern-checkmark-circle"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  className="modern-checkmark-check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>

            <p className="modern-modal-message">
              Votre demande de réservation a été envoyée avec succès ! Vous
              recevrez bientôt une confirmation du propriétaire.
            </p>

            {reservationId && (
              <p className="modern-reservation-id">
                <strong>Numéro de réservation:</strong> {reservationId}
              </p>
            )}

            <div className="modern-modal-summary">
              <h4>Résumé de votre réservation</h4>
              <div className="modern-modal-property">
                <div className="modern-modal-property-image">
                  {logement.photos && logement.photos.length > 0 ? (
                    <img src={logement.photos[0]} alt={logement.titre} />
                  ) : (
                    <div className="modern-modal-placeholder">
                      <FaHome />
                    </div>
                  )}
                </div>
                <div className="modern-modal-property-info">
                  <h5>{logement.titre}</h5>
                  <p>
                    {logement.adresse?.ville}, {logement.adresse?.pays}
                  </p>
                </div>
              </div>

              <div className="modern-modal-details">
                <div className="modern-modal-detail-row">
                  <span>Durée</span>
                  <span>{reservationDetails.dureeNuits} nuits</span>
                </div>
                <div className="modern-modal-detail-row">
                  <span>Prix par nuit</span>
                  <span>{logement.prix} €</span>
                </div>
                <div className="modern-modal-detail-total">
                  <span>Total</span>
                  <span>{reservationDetails.prixTotal} €</span>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="modern-modal-footer">
            <Button
              variant="outline-secondary"
              className="modern-modal-btn secondary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/MesReservations");
              }}
            >
              Voir mes réservations
            </Button>
            <Button
              variant="primary"
              className="modern-modal-btn primary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/");
              }}
            >
              Retour à l'accueil
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default ReservationForm;
