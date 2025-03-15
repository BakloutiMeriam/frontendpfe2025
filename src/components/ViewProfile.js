import React, { useEffect, useState, useContext } from "react";
import UserService from "../services/UserService";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const { user } = useContext(AuthContext); // Récupérer l'utilisateur connecté
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Utilisateur dans le contexte (ViewProfile):", user);
    const fetchUserProfile = async () => {
      try {
        // Vérifiez d'abord si l'utilisateur existe
        if (!user) {
          console.log("Pas d'utilisateur dans le contexte");
          setLoading(false);
          setError("Aucun utilisateur connecté");
          navigate("/login", { replace: true });
          return;
        }

        if (!user.role) {
          console.log("Pas de rôle défini pour l'utilisateur");
          // Au lieu de juste afficher une erreur, redirigez vers la page de complétion
          navigate(`/completer-profil/${user._id}`, { replace: true });
          return;
        }

        let data;
        if (user.role === "client") {
          data = await UserService.getUserProfileClient();
        } else if (user.role === "proprietaire") {
          data = await UserService.getUserProfileProp();
        } else {
          throw new Error(`Rôle inconnu: ${user.role}`);
        }

        console.log("Données du profil reçues:", data);
        setProfile(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, user]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      <h2>Bienvenue {profile.prenom}</h2>
      <p>
        <strong>Nom :</strong> {profile.nom}
      </p>
      <p>
        <strong>Prénom :</strong> {profile.prenom}
      </p>
      <p>
        <strong>Email :</strong> {profile.email}
      </p>
      <p>
        <strong>Rôle :</strong> {profile.role}
      </p>
      <p>
        <strong>N° téléphone :</strong> {profile.tel}
      </p>
      <p>
        <strong>Adresse :</strong> {profile.adresse}
      </p>
      <p>
        <strong>Photo de profil :</strong>
      </p>
      <img src={profile.url_img} alt="Profil" className="profile-image" />
      <p>
        <strong>Date d'inscription :</strong>{" "}
        {new Date(profile.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ViewProfile;
