import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
//import "../styles/register.css";

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

export default ProfileForm;
