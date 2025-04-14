import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaTools,
  FaShieldAlt,
  FaHeadset,
  FaInfoCircle,
  FaPaperPlane,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/devenirproprietaire.css";
import NavbarHome from "../components/NavbarHome.js";
import Footer from "../components/Footer.js";

const UpgradeToOwner = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Rediriger vers la page d'inscription quand on clique sur le bouton
  const handleUpgradeRequest = () => {
    navigate("/register"); // Redirection vers la page d'inscription
  };

  if (!user) return null; // Ne rien afficher pendant la redirection

  return (
    <>
      <NavbarHome />
      <div className="dpo-container">
        <div className="dpo-hero">
          <div className="container">
            <h1 className="dpo-hero-title">
              Devenez propriétaire sur notre plateforme
            </h1>
            <p className="dpo-hero-subtitle">
              Rejoignez des milliers de propriétaires et commencez à générer des
              revenus avec votre bien immobilier
            </p>
          </div>
        </div>

        <div className="container dpo-main py-5">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="dpo-card">
                <div className="dpo-card-header">
                  <h2 className="dpo-section-title">
                    Pourquoi devenir propriétaire ?
                  </h2>
                </div>
                <div className="dpo-card-body">
                  <div className="dpo-alert mb-4">
                    <FaInfoCircle className="me-2" />
                    <div>
                      <span>Vous êtes actuellement connecté en tant que </span>
                      <strong>{user.role || "utilisateur"}</strong>
                      <span>
                        . Pour ajouter votre logement, vous devez devenir
                        propriétaire.
                      </span>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="dpo-benefit-card">
                        <div className="dpo-benefit-icon">
                          <FaMoneyBillWave />
                        </div>
                        <div className="dpo-benefit-content">
                          <h3 className="dpo-benefit-title">
                            Revenus supplémentaires
                          </h3>
                          <p className="dpo-benefit-text">
                            Générez des revenus supplémentaires en louant votre
                            bien. Nos propriétaires gagnent en moyenne 6 500€
                            par an.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="dpo-benefit-card">
                        <div className="dpo-benefit-icon">
                          <FaTools />
                        </div>
                        <div className="dpo-benefit-content">
                          <h3 className="dpo-benefit-title">
                            Outils de gestion
                          </h3>
                          <p className="dpo-benefit-text">
                            Accédez à notre tableau de bord complet pour gérer
                            vos annonces, réservations et paiements facilement.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="dpo-benefit-card">
                        <div className="dpo-benefit-icon">
                          <FaShieldAlt />
                        </div>
                        <div className="dpo-benefit-content">
                          <h3 className="dpo-benefit-title">
                            Protection garantie
                          </h3>
                          <p className="dpo-benefit-text">
                            Bénéficiez de notre programme de protection pour les
                            propriétaires contre les dommages potentiels.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="dpo-benefit-card">
                        <div className="dpo-benefit-icon">
                          <FaHeadset />
                        </div>
                        <div className="dpo-benefit-content">
                          <h3 className="dpo-benefit-title">
                            Support prioritaire
                          </h3>
                          <p className="dpo-benefit-text">
                            Accédez à notre équipe de support dédiée aux
                            propriétaires disponible 24/7 pour vous accompagner.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="dpo-cta-card">
                <h3 className="dpo-cta-title">Prêt à commencer ?</h3>
                <p className="dpo-cta-text">
                  Rejoignez notre communauté de propriétaires et commencez à
                  générer des revenus dès aujourd'hui.
                </p>

                <div className="dpo-steps">
                  <div className="dpo-step">
                    <div className="dpo-step-number">1</div>
                    <div className="dpo-step-content">
                      <h4>Inscription</h4>
                      <p>Créez votre profil propriétaire</p>
                    </div>
                  </div>

                  <div className="dpo-step">
                    <div className="dpo-step-number">2</div>
                    <div className="dpo-step-content">
                      <h4>Ajout de votre bien</h4>
                      <p>Créez votre annonce</p>
                    </div>
                  </div>

                  <div className="dpo-step">
                    <div className="dpo-step-number">3</div>
                    <div className="dpo-step-content">
                      <h4>Recevez des réservations</h4>
                      <p>Et commencez à gagner de l'argent</p>
                    </div>
                  </div>
                </div>

                <div className="dpo-cta-actions">
                  <button
                    className="dpo-btn dpo-btn-primary"
                    onClick={handleUpgradeRequest}
                  >
                    <FaPaperPlane className="me-2" />
                    Devenir propriétaire
                  </button>
                  <Link to="/profile" className="dpo-btn dpo-btn-outline">
                    <FaArrowLeft className="me-2" />
                    Retour au profil
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="dpo-testimonials mt-5">
            <h2 className="dpo-section-title text-center mb-4">
              Ce que disent nos propriétaires
            </h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="dpo-testimonial-card">
                  <div className="dpo-testimonial-rating">
                    <span>★★★★★</span>
                  </div>
                  <p className="dpo-testimonial-text">
                    "Grâce à cette plateforme, j'ai pu rentabiliser mon
                    appartement secondaire et générer des revenus
                    supplémentaires chaque mois."
                  </p>
                  <div className="dpo-testimonial-author">
                    <div className="dpo-testimonial-avatar">
                      <span>ML</span>
                    </div>
                    <div>
                      <h4>Marie L.</h4>
                      <p>Propriétaire depuis 2022</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="dpo-testimonial-card">
                  <div className="dpo-testimonial-rating">
                    <span>★★★★★</span>
                  </div>
                  <p className="dpo-testimonial-text">
                    "Les outils de gestion sont vraiment intuitifs et le support
                    client est toujours disponible pour m'aider en cas de
                    besoin."
                  </p>
                  <div className="dpo-testimonial-author">
                    <div className="dpo-testimonial-avatar">
                      <span>TD</span>
                    </div>
                    <div>
                      <h4>Thomas D.</h4>
                      <p>Propriétaire depuis 2023</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="dpo-testimonial-card">
                  <div className="dpo-testimonial-rating">
                    <span>★★★★★</span>
                  </div>
                  <p className="dpo-testimonial-text">
                    "Je recommande à tous les propriétaires. Le processus est
                    simple et les paiements sont toujours à l'heure."
                  </p>
                  <div className="dpo-testimonial-author">
                    <div className="dpo-testimonial-avatar">
                      <span>SB</span>
                    </div>
                    <div>
                      <h4>Sophie B.</h4>
                      <p>Propriétaire depuis 2021</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UpgradeToOwner;
