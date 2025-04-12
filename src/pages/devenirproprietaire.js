import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/devenirproprietaire.css";
const UpgradeToOwner = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleUpgradeRequest = () => {
    // Ici vous implémenteriez la logique pour mettre à jour le rôle de l'utilisateur
    // Cela pourrait être un appel API à votre backend
    alert(
      "Votre demande a été envoyée à l'administrateur. Vous serez notifié une fois traitée."
    );
    // Rediriger vers la page de profil après la demande
    navigate("/profile");
  };

  if (!user) return null; // Ne rien afficher pendant la redirection

  return (
    <div className="upgrade-owner-container">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white p-4">
                <h2 className="mb-0">Devenez propriétaire</h2>
              </div>

              <div className="card-body p-4">
                <div className="alert alert-info mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  Vous êtes actuellement connecté en tant que{" "}
                  <strong>{user.role || "utilisateur"}</strong>. Pour ajouter
                  votre logement, vous devez devenir propriétaire.
                </div>

                <h5 className="card-title mb-4">
                  Avantages de devenir propriétaire :
                </h5>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div className="icon-circle bg-primary text-white me-3">
                            <i className="fas fa-money-bill-wave"></i>
                          </div>
                          <h6 className="mb-0 fw-bold">
                            Revenus supplémentaires
                          </h6>
                        </div>
                        <p className="card-text text-muted">
                          Générez un revenu passif en louant votre logement
                          pendant les périodes où vous ne l'utilisez pas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div className="icon-circle bg-primary text-white me-3">
                            <i className="fas fa-tools"></i>
                          </div>
                          <h6 className="mb-0 fw-bold">Outils de gestion</h6>
                        </div>
                        <p className="card-text text-muted">
                          Accédez à notre tableau de bord complet pour gérer vos
                          annonces, réservations et paiements.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div className="icon-circle bg-primary text-white me-3">
                            <i className="fas fa-shield-alt"></i>
                          </div>
                          <h6 className="mb-0 fw-bold">Protection garantie</h6>
                        </div>
                        <p className="card-text text-muted">
                          Bénéficiez de notre programme de protection pour les
                          hôtes contre les dommages potentiels.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div className="icon-circle bg-primary text-white me-3">
                            <i className="fas fa-headset"></i>
                          </div>
                          <h6 className="mb-0 fw-bold">Support prioritaire</h6>
                        </div>
                        <p className="card-text text-muted">
                          Accédez à notre équipe de support dédiée aux
                          propriétaires disponible 24/7.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-4">
                  <h5 className="mb-3">Comment devenir propriétaire ?</h5>
                  <p>
                    Pour devenir propriétaire sur notre plateforme, cliquez sur
                    le bouton ci-dessous. Notre équipe examinera votre demande
                    dans les plus brefs délais.
                  </p>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <button
                      className="btn btn-primary btn-lg px-4 py-2"
                      onClick={handleUpgradeRequest}
                    >
                      <i className="fas fa-home me-2"></i>
                      Devenir propriétaire
                    </button>
                    <Link
                      to="/profile"
                      className="btn btn-outline-secondary btn-lg px-4 py-2"
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Retour au profil
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToOwner;
