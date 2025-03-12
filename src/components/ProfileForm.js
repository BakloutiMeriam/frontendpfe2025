/*import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const ProfileForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    tel: "",
    adresse: "",
    url_img: "user.png",
    role: "user",
  });

  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, url_img: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📝 Données soumises :", formData);
    onSubmit(formData);
  };

  const handleRecaptcha = (value) => {
    if (value) {
      setIsVerified(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <input
        type="text"
        name="nom"
        placeholder="Nom"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="prenom"
        placeholder="Prénom"
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="mdp"
        placeholder="Mot de passe"
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="tel"
        placeholder="Téléphone"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="adresse"
        placeholder="Adresse"
        onChange={handleChange}
        required
      />
      <select name="role" onChange={handleChange}>
        <option value="client">Client</option>
        <option value="proprietaire">Propriétaire</option>
      </select>
      <input type="file" name="url_img" onChange={handleFileChange} />

      <ReCAPTCHA
        sitekey="6LdXKeMqAAAAALa0YT6upmH8_2Evh7-z_uABL6c7"
        onChange={handleRecaptcha}
      />
      <button type="submit" disabled={!isVerified}>
        S'inscrire
      </button>
    </form>
  );
};

export default ProfileForm;*/
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import "../styles/register.css";

const ProfileForm = ({ onSubmit, formError }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    tel: "",
    adresse: "",
    url_img: "user.png",
    role: "user",
  });

  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, url_img: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert("Veuillez vérifier que vous n'êtes pas un robot.");
      return;
    }
    onSubmit(formData);
  };

  const handleRecaptcha = (value) => {
    if (value) {
      setIsVerified(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      {/* Afficher le message d'erreur */}
      {formError && <p className="error-message">{formError}</p>}

      {/* Deux champs par ligne */}
      <div className="form-row">
        <div className="form-group">
          <input
            type="text"
            name="nom"
            placeholder="Entrer votre nom"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="prenom"
            placeholder="Entrer votre prénom"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="exemple@domaine.com"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="mdp"
            placeholder="********"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <input
            type="tel"
            name="tel"
            placeholder="00 000 000"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="adresse"
            placeholder="Entrer votre adresse"
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <select name="role" onChange={handleChange} required>
            <option value="" disabled selected>
              Choisir votre rôle
            </option>
            <option value="client">Client</option>
            <option value="proprietaire">Propriétaire</option>
          </select>
        </div>
        <div className="form-group">
          <input type="file" name="url_img" onChange={handleFileChange} />
        </div>
      </div>

      {/* reCAPTCHA */}
      <div className="recaptcha">
        <ReCAPTCHA
          sitekey="6LdXKeMqAAAAALa0YT6upmH8_2Evh7-z_uABL6c7"
          onChange={handleRecaptcha}
        />
      </div>

      {/* Bouton de soumission */}
      <button type="submit">S'inscrire</button>

      {/* Lien vers la page de connexion */}
      <p className="login-link">
        Vous avez un compte ? <Link to="/login">Connectez-vous</Link>
      </p>
    </form>
  );
};

export default ProfileForm;
//disabled={!isVerified}
