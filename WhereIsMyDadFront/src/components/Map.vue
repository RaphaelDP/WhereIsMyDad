<template>
  <div>
    <div id="map" style="height: 600px;"></div>
    <div>
      <h3>Add Coordinates to Polyline</h3>
      <p>
        Latitude: <input v-model="currentLat" type="number" placeholder="Enter Latitude" />
        Longitude: <input v-model="currentLng" type="number" placeholder="Enter Longitude" />
        <button @click="addCoordinate">Add to Polyline</button>
      </p>
      <p>
        <button @click="clearPolyline">Clear Polyline</button>
      </p>
      <h3>Check Point Location</h3>
      <p>
        Latitude: <input v-model="latitude" type="number" placeholder="Enter Latitude" />
        Longitude: <input v-model="longitude" type="number" placeholder="Enter Longitude" />
        <button @click="checkPoint">Check if on Land</button>
      </p>
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
      polyline: null,
      coordinates: [], // Store all coordinates for the polyline
      filteredCoordinates: [], // Store only land-based coordinates
      currentLat: 0,
      currentLng: 0,
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
      fetch("/ne_10m_land.json")
        .then((response) => response.json())
        .then((geojson) => {
          // Add GeoJSON layer to the map
          this.landLayer = L.geoJSON(geojson).addTo(this.map);
        })
        .catch((error) => {
          console.error("Error loading GeoJSON:", error);
        });
    },
    addCoordinate() {
      const lat = parseFloat(this.currentLat);
      const lng = parseFloat(this.currentLng);

      if (isNaN(lat) || isNaN(lng)) {
        alert("Invalid coordinates!");
        return;
      }

      // Add new coordinate
      const newCoord = [lat, lng];
      this.coordinates.push(newCoord);

      // Filter the coordinates for land-only segments
      this.updatePolyline();
    },
    updatePolyline() {
      if (!this.landLayer) {
        alert("Land data is not loaded yet. Please wait.");
        return;
      }

      // Clear the existing filtered coordinates and polyline
      this.filteredCoordinates = [];
      if (this.polyline) {
        this.map.removeLayer(this.polyline);
      }

      // Filter segments for land-only paths
      const landFeatures = this.landLayer.toGeoJSON().features;

      for (let i = 0; i < this.coordinates.length - 1; i++) {
        const start = turf.point(this.coordinates[i]);
        const end = turf.point(this.coordinates[i + 1]);
        const segment = turf.lineString([this.coordinates[i], this.coordinates[i + 1]]);

        // Check if the segment intersects land
        const isOnLand = landFeatures.some((feature) =>
          turf.booleanDisjoint(segment, feature) === false
        );

        if (isOnLand) {
          this.filteredCoordinates.push(this.coordinates[i]);
          // Add end point only if it's the last in the sequence
          if (i === this.coordinates.length - 2) {
            this.filteredCoordinates.push(this.coordinates[i + 1]);
          }
        }
      }

      // Draw the updated polyline
      if (this.filteredCoordinates.length > 1) {
        this.polyline = L.polyline(this.filteredCoordinates, { color: "blue" }).addTo(this.map);
        this.map.fitBounds(this.polyline.getBounds());
      }
    },
    clearPolyline() {
      this.coordinates = [];
      this.filteredCoordinates = [];
      if (this.polyline) {
        this.map.removeLayer(this.polyline);
        this.polyline = null;
      }
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
    },
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 600px;
}
</style>
