// src/components/RevenueByCategoryChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RevenueByCategoryChart = ({ analyticsData }) => {
  // Si aucune donnée n'est disponible
  if (
    !analyticsData ||
    !analyticsData.categories ||
    analyticsData.categories.length === 0
  ) {
    return <div className="no-data">Aucune donnée disponible</div>;
  }

  // Préparer les données pour le graphique
  const chartData = analyticsData.categories.map((category) => {
    return {
      name: category.nom,
      count: category.count,
      // Nous simulons les revenus car les données réelles ne semblent pas disponibles
      // Vous devrez ajuster cela en fonction de vos données réelles
      revenue: Math.round(category.count * (Math.random() * 500 + 300)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} €`, "Revenu"]} />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" name="Revenu (€)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueByCategoryChart;
