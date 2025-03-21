import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ListUsers.css";
import Navbar from "../components/Navbar";

const ProprietairesList = () => {
  const [proprietaires, setProprietaires] = useState([]);

  useEffect(() => {
    const fetchProprietaires = async () => {
      try {
        const response = await axios.get("/api/user/proprietaires");
        setProprietaires(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des propriétaires:",
          error
        );
      }
    };

    fetchProprietaires();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h1>Liste des Propriétaires</h1>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody>
              {proprietaires.map((proprietaire) => (
                <tr key={proprietaire._id}>
                  <td>{proprietaire.nom}</td>
                  <td>{proprietaire.prenom}</td>
                  <td>{proprietaire.email}</td>
                  <td>{proprietaire.tel}</td>
                  <td>{proprietaire.adresse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ProprietairesList;
