import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoginForm from "../components/loginForm";
import FacebookLogin from "react-facebook-login";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/auth.css";
import Navbar from "../components/Navbar";

const Login = () => {
  const { login, user, loginWithFacebook, loginWithGoogle } =
    useContext(AuthContext);
  const [errors, setErrors] = useState({ email: "", mdp: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const redirectionInProgress = useRef(false);

  // Fonction pour vérifier si un profil nécessite d'être complété
  const needsProfileCompletion = (userData) => {
    // Vérifier si le flag needsProfileCompletion est explicitement défini
    if (userData.needsProfileCompletion === true) {
      return true;
    }

    // Pour les utilisateurs qui se sont inscrits via réseaux sociaux
    // et qui n'ont pas rempli leurs informations
    if (userData.loginType === "facebook" || userData.loginType === "google") {
      return (
        !userData.tel ||
        userData.tel === 0 ||
        !userData.adresse ||
        userData.adresse === "adresse"
      );
    }

    // Pour les utilisateurs qui se sont inscrits normalement (email/mot de passe),
    // on considère que leur profil est déjà complet
    return false;
  };

  useEffect(() => {
    // Ignorer si une redirection est déjà en cours ou si nous sommes sur la page de complétion
    if (
      redirectionInProgress.current ||
      !user ||
      location.pathname.includes("/completer-profil") ||
      location.pathname.includes("/confirmation")
    ) {
      return;
    }

    // Pour éviter les redirections multiples
    redirectionInProgress.current = true;
    console.log("Évaluation de la redirection pour:", user);

    try {
      if (user.role === "admin") {
        navigate("/profileAdmin", { replace: true });
      } else if (
        user.role === "proprietaire" &&
        user.approvalStatus === "pending"
      ) {
        console.log("Propriétaire en attente, redirection vers confirmation");
        navigate("/confirmation", { replace: true });
      } else if (needsProfileCompletion(user)) {
        console.log(
          "Profil incomplet détecté, redirection vers la page de complétion"
        );
        navigate(`/completer-profil/${user._id}`, { replace: true });
      } else {
        console.log("Profil complet, redirection vers /profile");
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      console.error("Erreur lors de la redirection:", error);
      // En cas d'erreur, aller sur une page sûre
      navigate("/login", { replace: true });
    }

    // Réinitialiser le drapeau après un délai pour permettre d'autres redirections à l'avenir
    setTimeout(() => {
      redirectionInProgress.current = false;
    }, 1000);
  }, [user, navigate, location.pathname]);

  const handleSubmit = async (email, mdp) => {
    const newErrors = { email: "", mdp: "" };

    try {
      await login(email, mdp);
    } catch (error) {
      if (error.message.includes("Email")) {
        newErrors.email = error.message;
      } else if (error.message.includes("Mot de passe")) {
        newErrors.mdp = error.message;
      } else {
        newErrors.general = "Une erreur est survenue. Veuillez réessayer.";
      }
      setErrors(newErrors);
    }
  };

  // Fonctions pour gestion des connexions sociales
  const handleFacebookLoginFailure = (error) => {
    console.error("Facebook login error:", error);
    alert("Échec de la connexion avec Facebook. Veuillez réessayer.");
  };

  const handleFacebookLoginSuccess = async (response) => {
    console.log("Facebook login success:", response);

    if (response.accessToken) {
      try {
        await loginWithFacebook(response.accessToken);
      } catch (error) {
        console.error("Erreur lors de la connexion Facebook :", error);
        alert("Erreur lors de la connexion avec Facebook.");
      }
    } else {
      console.error("Pas de token d'accès reçu");
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      await loginWithGoogle(response.credential);
    } catch (error) {
      console.error("Erreur d'authentification Google", error);
      alert("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="color-blob"></div>
        <div className="auth-card-centered">
          <h2>Identifiez-vous</h2>
          {/*<div className="reset-logo2">
            <img src="/images/logo2.png" alt="Logo" />
          </div>*/}
          <LoginForm
            login={login}
            errors={errors}
            setErrors={setErrors}
            handleSubmit={handleSubmit}
          />
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={() => navigate("/forgot-password")}
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="separator">
            <hr className="separator-line" />
            <span className="separator-text">ou</span>
            <hr className="separator-line" />
          </div>
          <div className="social-login">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={(error) => console.error("Google login error:", error)}
            />
          </div>
          <div className="social-login">
            <FacebookLogin
              appId="646369371125852"
              autoLoad={false}
              fields="name,email,picture"
              callback={handleFacebookLoginSuccess}
              onFailure={handleFacebookLoginFailure}
              icon="bi-facebook"
              textButton=" Se connecter avec Facebook"
              cssClass="btn-primary w-100"
            />
          </div>
          <div className="text-center mt-4">
            <p
              style={{
                display: "inline",
                marginRight: "5px",
                fontSize: "14px",
              }}
            >
              Vous n'avez pas de compte ?
            </p>
            <button
              className="btn btn-link"
              onClick={() => navigate("/register")}
              style={{ padding: 0, margin: 0, verticalAlign: "baseline" }}
            >
              Inscrivez-vous
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
