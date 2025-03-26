import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue with Leaflet and React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const CarteMap = ({ logements }) => {
  return (
    <MapContainer
      center={[48.8566, 2.3522]} // Default to Paris
      zoom={6}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {logements.map(
        (logement) =>
          logement.adresse.latitude &&
          logement.adresse.longitude && (
            <Marker
              key={logement._id}
              position={[logement.adresse.latitude, logement.adresse.longitude]}
            >
              <Popup>
                <div>
                  <h5>{logement.titre}</h5>
                  <p>
                    {logement.adresse.rue}, {logement.adresse.ville}
                  </p>
                  <p>Prix: {logement.prix}€/nuit</p>
                </div>
              </Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
};

export default CarteMap;
