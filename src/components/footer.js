import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "../styles/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="stayzy-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 footer-column">
            <div className="footer-logo">
              <img src="/images/logo2.png" alt="Stayzy Logo" />
            </div>
            <p className="footer-description">
              Trouvez le logement idéal pour vos séjours. Des appartements aux
              villas, Stayzy vous propose une large sélection d'hébergements de
              qualité.
            </p>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="https://twitter.com"
                className="social-icon"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="col-md-3 footer-column">
            <h4 className="footer-heading">Liens utiles</h4>
            <ul className="footer-links">
              <li>
                <Link to="/Nous">Qui sommes-nous</Link>
              </li>
              <li>
                <Link to="/aide">Centre d'aide</Link>
              </li>
              <li>
                <Link to="/devenir-hote">Devenir hôte</Link>
              </li>
              <li>
                <Link to="/confidentialite">Confidentialité</Link>
              </li>
              <li>
                <Link to="/conditions">Conditions générales</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-2 footer-column">
            <h4 className="footer-heading">Explorer</h4>
            <ul className="footer-links">
              <li>
                <Link to="/logements">Tous les logements</Link>
              </li>
              <li>
                <Link to="/villes">Villes populaires</Link>
              </li>
              <li>
                <Link to="/experiences">Expériences</Link>
              </li>
              <li>
                <Link to="/promotions">Promotions</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-3 footer-column">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact">
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 Avenue de Paris, 75000 Paris</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:contact@stayzy.com">contact@stayzy.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="row">
            <div className="col-md-6">
              <p className="copyright">
                © {currentYear} Stayzy. Tous droits réservés.
              </p>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <Link to="/cookies">Cookies</Link>
                <Link to="/legal">Mentions légales</Link>
                <Link to="/sitemap">Plan du site</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
