// src/components/ReservationStatusChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const ReservationStatusChart = ({ stats }) => {
  // Si aucune donnée n'est disponible
  if (!stats || !stats.reservations) {
    return <div className="no-data">Aucune donnée disponible</div>;
  }

  const data = [
    {
      name: "En attente",
      value: stats.reservations.pending || 0,
      color: "#FFC107",
    },
    {
      name: "Confirmées",
      value: stats.reservations.confirmed || 0,
      color: "#4CAF50",
    },
    {
      name: "Annulées/Refusées",
      value:
        stats.reservations.total -
          (stats.reservations.pending + stats.reservations.confirmed) || 0,
      color: "#F44336",
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}`, "Réservations"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ReservationStatusChart;
