<template>
    <div>
      <div id="map" style="height: 600px;"></div>
      <div>
        <p>
          Latitude: <input v-model="latitude" type="number" /> Longitude:
          <input v-model="longitude" type="number" />
        </p>
        <button @click="checkPoint">Check if on Land</button>
        <p>{{ resultMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import * as turf from "@turf/turf";
  
  export default {
    data() {
      return {
        map: null,
        landLayer: null,
        latitude: 0,
        longitude: 0,
        resultMessage: "",
      };
    },
    mounted() {
      this.initializeMap();
    },
    methods: {
      initializeMap() {
        // Initialize the map
        this.map = L.map("map").setView([0, 0], 2);
  
        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(this.map);
  
        // Load GeoJSON file (replace with your GeoJSON path)
        fetch("/ne_10m_land.json") // Update the path accordingly
          .then((response) => response.json())
          .then((geojson) => {
            // Add GeoJSON layer to the map
            this.landLayer = L.geoJSON(geojson).addTo(this.map);
          });
      },
      checkPoint() {
  if (!this.landLayer) {
    this.resultMessage = "Land data is not yet loaded. Please wait.";
    return;
  }

  const lat = parseFloat(this.latitude);
  const lng = parseFloat(this.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    this.resultMessage = "Invalid coordinates!";
    return;
  }

  const point = turf.point([lng, lat]);
  const landFeatures = this.landLayer.toGeoJSON().features;

  // Check if the point is in any land polygon
  const isOnLand = landFeatures.some((feature) =>
    turf.booleanPointInPolygon(point, feature)
  );

  this.resultMessage = isOnLand
    ? "The point is on land."
    : "The point is in the ocean.";
}

    },
  };
  </script>
  
  <style>
  #map {
    width: 100%;
    height: 600px;
  }
  </style>
  