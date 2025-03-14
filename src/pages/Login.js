import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/users");
      } else {
        navigate("/profile");
      }
    }
  }, [user, navigate]);

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

  /*const handleFacebookLoginSuccess = async (response) => {
    console.log("Facebook login success:", response);

    if (response.accessToken) {
      try {
        const data = await loginWithFacebook(response.accessToken);
        console.log("Données reçues du backend :", data);
        const user = data.user || data;
        //const isProfileComplete = user.tel === 0 && user.adresse === "adresse";

        if (
          user.tel === 0 &&
          user.adresse === "adresse" &&
          user.role === "client"
        ) {
          const userId = user._id;
          navigate(`/completer-profil/${userId}`);
        } else {
          navigate("/profile");
        }
      } catch (error) {
        console.error("Erreur lors de la connexion Facebook :", error);
        alert("Erreur lors de la connexion avec Facebook.");
      }
    } else {
      console.error("Pas de token d'accès reçu");
    }
  };*/

  const handleFacebookLoginFailure = (error) => {
    console.error("Facebook login error:", error);
    alert("Échec de la connexion avec Facebook. Veuillez réessayer.");
  };

  /*const handleGoogleLoginSuccess = async (response) => {
    try {
      const userData = await loginWithGoogle(response.credential);
      console.log("Données utilisateur après connexion Google:", userData);

      // Vérifiez si le profil est complet (indépendamment de isNewUser)
      const user = userData.user || userData;
      const isProfileComplete =
        user.tel === 0 && user.adresse === "adresse" && user.role === "client";

      if (!isProfileComplete) {
        console.log(
          "Utilisateur Google avec profil incomplet, redirection vers compléter profil"
        );
        navigate("/completer-profileGoogle", { state: { user } });
      } else {
        console.log(
          "Utilisateur Google avec profil complet, redirection vers profile"
        );
        navigate("/profile");
      }
    } catch (error) {
      console.error("Erreur d'authentification Google", error);
      alert("Erreur lors de la connexion avec Google.");
    }
  };*/
  const handleFacebookLoginSuccess = async (response) => {
    console.log("Facebook login success:", response);

    if (response.accessToken) {
      try {
        const data = await loginWithFacebook(response.accessToken);
        console.log("Données reçues du backend :", data);

        // Vérifiez si les champs ont des valeurs par défaut
        const isProfileIncomplete =
          data.tel === 0 ||
          data.adresse === "adresse" ||
          data.role === "client";

        if (isProfileIncomplete) {
          console.log("Profil incomplet, redirection vers /completer-profil");
          navigate(`/completer-profil/${data._id}`, { replace: true }); // Utilisez { replace: true } pour éviter les conflits de redirection
        } else {
          console.log("Profil complet, redirection vers /profile");
          navigate("/profile", { replace: true }); // Utilisez { replace: true } pour éviter les conflits de redirection
        }
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
      const userData = await loginWithGoogle(response.credential);
      console.log("Données utilisateur après connexion Google:", userData); // <-- Vérifiez ici

      const user = userData.user || userData;
      const isProfileComplete = user.tel && user.adresse && user.role;

      if (!isProfileComplete) {
        console.log("Profil incomplet, redirection vers /completer-profil");
        navigate(`/completer-profil/${user._id}`);
      } else {
        console.log("Profil complet, redirection vers /profile");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Erreur d'authentification Google", error);
      alert("Erreur lors de la connexion avec Google.");
    }
  };
  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-left">
          <div>
            <h1>Bienvenue sur Stayzy</h1>
            <p>Connectez-vous pour accéder à votre espace personnel.</p>
            <img src="/images/5.jpg" alt="Illustration" />
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <h2>Identifiez-vous !</h2>
            <div className="reset-logo2">
              <img src="/images/logo.jpg" alt="Logo" />
            </div>
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
                textButton=" Continuer avec Facebook"
                cssClass="btn-primary"
              />
            </div>
            <div className="text-center mt-3">
              <p
                style={{
                  display: "inline",
                  marginRight: "5px",
                  fontSize: "12px",
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
      </div>
    </>
  );
};

export default Login;
