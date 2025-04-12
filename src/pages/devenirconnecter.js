import React from "react";
import { Link } from "react-router-dom";
import "../styles/devenirhote.css";

const DevenirHote = () => {
  return (
    <div className="devenir-hote-page">
      <div className="top-sections-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Devenez hôte et commencez à gagner</h1>
            <p>
              Transformez votre espace en source de revenus et rejoignez notre
              communauté d'hôtes
            </p>
          </div>
        </div>

        <div className="cta-card">
          <div className="cta-card-content">
            <h2>Prêt à vous lancer ?</h2>
            <p>
              Rejoignez notre communauté d'hôtes et commencez à gagner dès
              aujourd'hui.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                S'inscrire maintenant
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="benefits-section">
        <div className="container">
          <h2>Pourquoi devenir hôte ?</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <h3>Revenus supplémentaires</h3>
              <p>
                Gagnez jusqu'à 1500€ par mois en louant votre bien pendant les
                périodes qui vous conviennent.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-globe"></i>
              </div>
              <h3>Rencontres enrichissantes</h3>
              <p>
                Élargissez vos horizons en accueillant des voyageurs du monde
                entier.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Sécurité garantie</h3>
              <p>
                Profitez d'une assurance hôte et d'un support 24/7 pour une
                tranquillité d'esprit totale.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <div className="container">
          <h2>Comment commencer ?</h2>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Créez votre profil</h3>
                <p>
                  Inscrivez-vous en quelques minutes et personnalisez votre
                  profil d'hôte.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Présentez votre logement</h3>
                <p>
                  Ajoutez des photos et une description détaillée pour mettre en
                  valeur votre bien.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Définissez vos tarifs</h3>
                <p>
                  Fixez le prix qui vous convient, avec notre aide pour
                  optimiser vos revenus.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Accueillez vos premiers voyageurs</h3>
                <p>
                  Recevez des réservations et commencez votre aventure d'hôte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <div className="container">
          <h2>Ce que disent nos hôtes</h2>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Devenir hôte a complètement changé ma vie. Je gagne maintenant
                assez pour financer mes propres voyages !"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Marie D.</h4>
                  <p>Hôte depuis 2 ans à Lyon</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-text">
                "Le processus d'inscription était si simple, et j'ai reçu ma
                première réservation en moins de 48 heures."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Thomas L.</h4>
                  <p>Hôte depuis 6 mois à Paris</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevenirHote;
