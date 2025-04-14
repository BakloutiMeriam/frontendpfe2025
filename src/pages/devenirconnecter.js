import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaArrowLeft,
  FaInfoCircle,
  FaUser,
  FaUserPlus,
  FaHome,
  FaHandshake,
  FaStar,
} from "react-icons/fa";
import NavbarHome from "../components/NavbarHome";
import Footer from "../components/Footer";
import "../styles/devenirconnecter.css"; // Assurez-vous de créer ce fichier CSS

const DevenirConnecter = () => {
  return (
    <>
      <NavbarHome />
      <div className="dc-container">
        <div className="dc-hero">
          <div className="container">
            <h1 className="dc-hero-title">Accès réservé aux propriétaires</h1>
            <p className="dc-hero-subtitle">
              Connectez-vous ou créez un compte pour accéder à toutes les
              fonctionnalités de Stayzy
            </p>
          </div>
        </div>

        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="dc-main-card">
                <div className="dc-card-header">
                  <img
                    src="/images/logo2.png"
                    alt="Logo Stayzy"
                    className="dc-logo"
                  />
                  <h2 className="dc-card-title">
                    Mettre mon logement sur Stayzy
                  </h2>
                </div>

                <div className="dc-card-body">
                  <div className="dc-alert">
                    <FaInfoCircle className="dc-alert-icon" />
                    <div>
                      La fonctionnalité{" "}
                      <strong>"Mettre mon logement sur Stayzy"</strong> est
                      réservée aux propriétaires approuvés par notre service.
                      Veuillez vous connecter ou créer un compte pour continuer.
                    </div>
                  </div>

                  <div className="dc-option-section">
                    <h3 className="dc-option-title">
                      <FaUser className="me-2" /> Vous avez déjà un compte ?
                    </h3>
                    <p className="dc-option-text">
                      Connectez-vous pour accéder à votre espace propriétaire ou
                      demander l'approbation de votre compte en tant que
                      propriétaire.
                    </p>
                    <Link to="/login" className="dc-btn dc-btn-primary">
                      Se connecter
                    </Link>
                  </div>

                  <div className="dc-option-section">
                    <h3 className="dc-option-title">
                      <FaUserPlus className="me-2" /> Nouveau sur Stayzy ?
                    </h3>
                    <p className="dc-option-text">
                      Créez un compte pour profiter de tous nos services et
                      faire une demande pour devenir propriétaire approuvé sur
                      notre plateforme.
                    </p>
                    <Link to="/register" className="dc-btn dc-btn-outline">
                      Créer un compte
                    </Link>
                  </div>

                  <div className="dc-bottom-link">
                    <Link to="/" className="dc-link">
                      <FaArrowLeft className="dc-link-icon" />
                      Retourner à l'accueil
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dc-features">
            <h3 className="dc-features-title">Avantages de notre plateforme</h3>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="dc-feature-card">
                  <div className="dc-feature-icon">
                    <FaHome />
                  </div>
                  <h4 className="dc-feature-title">Gestion simplifiée</h4>
                  <p className="dc-feature-text">
                    Des outils intuitifs pour gérer vos annonces, réservations
                    et paiements en quelques clics.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="dc-feature-card">
                  <div className="dc-feature-icon">
                    <FaHandshake />
                  </div>
                  <h4 className="dc-feature-title">Assistance dédiée</h4>
                  <p className="dc-feature-text">
                    Une équipe de support disponible 24/7 pour vous accompagner
                    dans toutes vos démarches.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="dc-feature-card">
                  <div className="dc-feature-icon">
                    <FaStar />
                  </div>
                  <h4 className="dc-feature-title">Visibilité optimale</h4>
                  <p className="dc-feature-text">
                    Augmentez l'exposition de vos biens grâce à notre large
                    audience et nos outils de promotion.
                  </p>
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

export default DevenirConnecter;
