import { useState } from "react";

const LoginForm = ({ errors, setErrors, handleSubmit }) => {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");

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
      <div className="mb-3">
        <input
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="exemple@gmail.com"
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>
      <div className="mb-3">
        <input
          type="password"
          className={`form-control ${errors.mdp ? "is-invalid" : ""}`}
          value={mdp}
          onChange={(e) => setMdp(e.target.value)}
          required
          placeholder="**************"
        />
        {errors.mdp && <div className="invalid-feedback">{errors.mdp}</div>}
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Se connecter
      </button>
    </form>
  );
};
export default LoginForm;
