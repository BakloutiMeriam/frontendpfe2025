/*import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginForm from "../components/loginForm";
import FacebookLogin from "react-facebook-login";
import Navbar from "../components/Navbar";
import "../styles/auth.css";

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [errors, setErrors] = useState({ email: "", mdp: "" });
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/users");
      } else {
        navigate("/dashboard");
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

  const handleFacebookLoginSuccess = async (response) => {
    console.log("Facebook login success:", response);

    if (response.accessToken) {
      try {
        const res = await fetch(
          "http://localhost:3000/api/user/facebook-login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken: response.accessToken }),
            mode: "cors",
          }
        );

        const data = await res.json();
        console.log("Données reçues du backend :", data);
        if (data.success) {
          console.log("Utilisateur connecté :", data.user);
          if (!data.user.tel || !data.user.adresse || !data.user.role) {
            navigate(`/completer-profil/${data.user._id}`);
          } else {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la connexion Facebook :", error);
        alert("Erreur lors de la connexion avec Facebook.");
      }
    } else {
      console.error("Pas de token d'accès reçu");
    }
  };
  const handleFacebookLoginFailure = (error) => {
    console.error("Facebook login error:", error);
    alert("Échec de la connexion avec Facebook. Veuillez réessayer.");
  };

  return (
    <>
      <Navbar />
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
          <h2 className="text-center mb-4">Connexion</h2>
          <LoginForm
            login={login}
            errors={errors}
            setErrors={setErrors}
            handleSubmit={handleSubmit}
          />
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              style={{ textDecoration: "none" }}
              onClick={() => navigate("/forgot-password")}
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="d-flex justify-content-center mt-3">
            <FacebookLogin
              appId="646369371125852"
              autoLoad={false}
              fields="name,email,picture"
              callback={handleFacebookLoginSuccess}
              onFailure={handleFacebookLoginFailure}
              icon="fa-facebook"
              textButton=" Se connecter avec Facebook"
              cssClass="btn btn-primary"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;*/
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoginForm from "../components/loginForm";
import FacebookLogin from "react-facebook-login";
import "../styles/auth.css";

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [errors, setErrors] = useState({ email: "", mdp: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/users");
      } else {
        navigate("/dashboard");
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

  const handleFacebookLoginSuccess = async (response) => {
    console.log("Facebook login success:", response);

    if (response.accessToken) {
      try {
        const res = await fetch(
          "http://localhost:3000/api/user/facebook-login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken: response.accessToken }),
            mode: "cors",
          }
        );

        const data = await res.json();
        console.log("Données reçues du backend :", data);
        if (data.success) {
          console.log("Utilisateur connecté :", data.user);
          if (!data.user.tel || !data.user.adresse || !data.user.role) {
            navigate(`/completer-profil/${data.user._id}`);
          } else {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la connexion Facebook :", error);
        alert("Erreur lors de la connexion avec Facebook.");
      }
    } else {
      console.error("Pas de token d'accès reçu");
    }
  };

  const handleFacebookLoginFailure = (error) => {
    console.error("Facebook login error:", error);
    alert("Échec de la connexion avec Facebook. Veuillez réessayer.");
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-left">
          <div>
            <h1>Bienvenue sur notre plateforme</h1>
            <p>Connectez-vous pour accéder à votre espace personnel.</p>
            <img src="/images/5.jpg" alt="Illustration" />
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <h2>Connexion</h2>
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
            <div className="social-login">
              <FacebookLogin
                appId="646369371125852"
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookLoginSuccess}
                onFailure={handleFacebookLoginFailure}
                icon="bi-facebook"
                textButton=" Se connecter avec Facebook"
                cssClass="btn-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
