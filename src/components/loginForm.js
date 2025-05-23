import { useState } from "react";

const LoginForm = ({ errors, setErrors, handleSubmit }) => {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    const regex = /^.{6,}$/;
    return regex.test(password);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = { email: "", mdp: "" };

    if (!email || !mdp) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    if (!validatePassword(mdp)) {
      newErrors.mdp = "Le mot de passe doit comporter au moins 6 caractères.";
      setErrors(newErrors);
      return;
    }

    setErrors(newErrors);
    handleSubmit(email, mdp);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {errors.general && (
        <div className="alert alert-danger">{errors.general}</div>
      )}
      <div className="form-floating mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-envelope-fill"></i>
          </span>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="exemple@gmail.com"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>
      </div>
      <div className="form-floating mb-4">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-lock-fill"></i>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            className={`form-control ${errors.mdp ? "is-invalid" : ""}`}
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            required
            placeholder="Mot de passe"
          />
          <button
            type="button"
            className="btn btn-outline-secondary password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
          </button>
          {errors.mdp && <div className="invalid-feedback">{errors.mdp}</div>}
        </div>
      </div>
      <button type="submit" className="btn btn-primary w-100 login-btn">
        Se connecter
      </button>
    </form>
  );
};

export default LoginForm;
