import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CategoriesPieChart = ({ categories }) => {
  // Vérifier si les données sont disponibles
  if (!categories || categories.length === 0) {
    return (
      <div className="no-data">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  // Préparer les données pour le graphique
  const data = categories.map((category) => ({
    name: category.nom,
    value: category.count,
    id: category._id,
  }));

  // Générer des couleurs cohérentes basées sur les IDs
  const getColor = (id) => {
    // Créer un nombre à partir de la chaîne id
    let hash = 0;
    for (let i = 0; i < id.toString().length; i++) {
      hash = id.toString().charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convertir en couleur hexadécimale
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }

    return color;
  };

  // Couleurs pour les cellules du graphique
  const COLORS = data.map((item) => getColor(item.id));

  // Composant personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-pie-tooltip">
          <p className="pie-tooltip-name">{payload[0].name}</p>
          <p className="pie-tooltip-value">
            <span style={{ color: payload[0].color }}>■</span>{" "}
            {payload[0].value} logements
          </p>
          <p className="pie-tooltip-percent">
            {(
              (payload[0].value /
                data.reduce((sum, item) => sum + item.value, 0)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  // Composant personnalisé pour la légende
  const renderLegend = () => (
    <div className="categories-legend">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="category-item">
          <span
            className="category-color"
            style={{ backgroundColor: COLORS[index] }}
          ></span>
          <span className="category-name">{entry.name}</span>
          <span className="category-count">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="categories-chart">
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              animationDuration={1000}
              animationBegin={0}
              animationEasing="ease-out"
              label={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {renderLegend()}
    </div>
  );
};

export default CategoriesPieChart;
