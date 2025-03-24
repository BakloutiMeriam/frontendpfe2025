import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import Layout from "../components/Layout";

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [proprietaireCount, setProprietaireCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le nombre d'utilisateurs
        const usersResponse = await axios.get("/api/user/count");
        setUserCount(usersResponse.data.count);

        // Récupérer le nombre de propriétaires
        const proprietairesResponse = await axios.get(
          "/api/user/count/proprietaires"
        );
        setProprietaireCount(proprietairesResponse.data.count);

        // Récupérer le nombre de clients
        const clientsResponse = await axios.get("/api/user/count/clients");
        setClientCount(clientsResponse.data.count);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Layout>
        <div className="dashboard">
          <h1>Tableau de Bord Admin</h1>
          <div className="cards-container">
            <div className="card">
              <h2>Nombre d'utilisateurs</h2>
              <p>{userCount}</p>
            </div>
            <div className="card">
              <h2>Nombre de propriétaires</h2>
              <p>{proprietaireCount}</p>
            </div>
            <div className="card">
              <h2>Nombre de clients</h2>
              <p>{clientCount}</p>
            </div>
            <div className="card">
              <h2>Nombre de logements</h2>
              <p>?</p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
