import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";

const ProfileForm = ({ onSubmit, formError }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    confirmMdp: "",
    tel: "",
    adresse: "",
    role: "client",
    url_img: null,
  });

  const [isVerified, setIsVerified] = useState(false);
  const [fileName, setFileName] = useState("Choisir une image");
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "url_img" && files && files[0]) {
      // Validation du type de fichier image
      const file = files[0];
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
      ];

      if (!validImageTypes.includes(file.type)) {
        setValidationErrors({
          ...validationErrors,
          url_img: "Format d'image non supporté. Utilisez JPEG, PNG ou GIF.",
        });
        return;
      }

      if (file.size > 5000000) {
        // 5MB
        setValidationErrors({
          ...validationErrors,
          url_img:
            "L'image est trop volumineuse. La taille maximale est de 5MB.",
        });
        return;
      }

      setFormData({ ...formData, [name]: file });
      setFileName(file.name);
      setValidationErrors({
        ...validationErrors,
        url_img: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });

      // Validation des champs
      validateField(name, value);
    }
  };

  const validateField = (name, value) => {
    let errors = { ...validationErrors };

    switch (name) {
      case "nom":
      case "prenom":
        if (!value.trim()) {
          errors[name] = `Le ${name === "nom" ? "nom" : "prénom"} est requis`;
        } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) {
          errors[name] = `Le ${
            name === "nom" ? "nom" : "prénom"
          } ne doit contenir que des lettres`;
        } else {
          delete errors[name];
        }
        break;

      case "email":
        if (!value.trim()) {
          errors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "L'email n'est pas valide";
        } else {
          delete errors.email;
        }
        break;

      case "tel":
        if (!value.trim()) {
          errors.tel = "Le numéro de téléphone est requis";
        } else if (!/^\d{8}$/.test(value)) {
          errors.tel = "Le numéro de téléphone doit contenir 8 chiffres";
        } else {
          delete errors.tel;
        }
        break;

      case "mdp":
        if (!value.trim()) {
          errors.mdp = "Le mot de passe est requis";
        } else if (value.length < 6) {
          errors.mdp = "Le mot de passe doit contenir au moins 6 caractères";
        } else {
          delete errors.mdp;

          // Vérifier la confirmation du mot de passe
          if (formData.confirmMdp && formData.confirmMdp !== value) {
            errors.confirmMdp = "Les mots de passe ne correspondent pas";
          } else if (formData.confirmMdp) {
            delete errors.confirmMdp;
          }
        }
        break;

      case "confirmMdp":
        if (!value.trim()) {
          errors.confirmMdp = "La confirmation du mot de passe est requise";
        } else if (value !== formData.mdp) {
          errors.confirmMdp = "Les mots de passe ne correspondent pas";
        } else {
          delete errors.confirmMdp;
        }
        break;

      case "adresse":
        if (!value.trim()) {
          errors.adresse = "L'adresse est requise";
        } else {
          delete errors.adresse;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return errors;
  };

  const validateForm = () => {
    let errors = {};

    // Valider tous les champs
    Object.keys(formData).forEach((field) => {
      if (field !== "url_img") {
        const fieldErrors = validateField(field, formData[field]);
        errors = { ...errors, ...fieldErrors };
      }
    });

    return Object.keys(errors).length === 0;
  };

  const handleRecaptcha = (value) => {
    setIsVerified(!!value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isVerified) {
      alert("Veuillez vérifier que vous n'êtes pas un robot.");
      return;
    }

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {formError && <div className="error-message">{formError}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="prenom">Prénom</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            placeholder="Entrez votre prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
          {validationErrors.prenom && (
            <div className="error-text">{validationErrors.prenom}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="nom">Nom</label>
          <input
            type="text"
            id="nom"
            name="nom"
            placeholder="Entrez votre nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
          {validationErrors.nom && (
            <div className="error-text">{validationErrors.nom}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="exemple@email.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validationErrors.email && (
          <div className="error-text">{validationErrors.email}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mdp">Mot de passe</label>
          <input
            type="password"
            id="mdp"
            name="mdp"
            placeholder="Minimum 6 caractères"
            value={formData.mdp}
            onChange={handleChange}
            required
          />
          {validationErrors.mdp && (
            <div className="error-text">{validationErrors.mdp}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmMdp">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmMdp"
            name="confirmMdp"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmMdp}
            onChange={handleChange}
            required
          />
          {validationErrors.confirmMdp && (
            <div className="error-text">{validationErrors.confirmMdp}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tel">Téléphone</label>
          <input
            type="text"
            id="tel"
            name="tel"
            placeholder="8 chiffres"
            value={formData.tel}
            onChange={handleChange}
            required
          />
          {validationErrors.tel && (
            <div className="error-text">{validationErrors.tel}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="adresse">Adresse</label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            placeholder="Votre adresse"
            value={formData.adresse}
            onChange={handleChange}
            required
          />
          {validationErrors.adresse && (
            <div className="error-text">{validationErrors.adresse}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="role">Vous êtes</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="client">Client</option>
          <option value="proprietaire">Propriétaire</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="url_img">Photo de profil</label>
        <div className="file-upload">
          <label className="file-upload-label">
            <i className="fas fa-upload"></i>
            {fileName}
            <input
              type="file"
              id="url_img"
              name="url_img"
              accept="image/jpeg, image/png, image/gif, image/jpg"
              onChange={handleChange}
              required
            />
          </label>
        </div>
        {validationErrors.url_img && (
          <div className="error-text">{validationErrors.url_img}</div>
        )}
        <small className="text-muted">
          Formats acceptés: JPG, PNG, GIF. Max: 5MB
        </small>
      </div>

      {/* reCAPTCHA */}
      <div className="recaptcha">
        <ReCAPTCHA
          sitekey="6LdXKeMqAAAAALa0YT6upmH8_2Evh7-z_uABL6c7"
          onChange={handleRecaptcha}
        />
      </div>

      <button type="submit">S'inscrire</button>

      <div className="login-link">
        Vous avez déjà un compte? <Link to="/login">Se connecter</Link>
      </div>
    </form>
  );
};

export default ProfileForm;
