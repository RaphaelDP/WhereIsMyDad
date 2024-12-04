<template>
    <div>
      <!-- Date Range Selectors for Blue and Red Polyline -->
      <div>
        <!-- Blue Polyline Date Range -->
       <div class="blue">
        <label for="startDateBlue">Start Date (Blue Polyline):</label>
        <input type="datetime-local" v-model="startDateBlue" @change="filterPoints" />
  
        <label for="endDateBlue">End Date (Blue Polyline):</label>
        <input type="datetime-local" v-model="endDateBlue" @change="filterPoints" />
        <button class="blue" @click="toggleBluePolylineVisibility">
          {{ blueVisible ? 'Hide Blue Polyline' : 'Show Blue Polyline' }}
        </button>
       </div>
        <div class="red">
                    <!-- Red Polyline Date Range -->
        <label for="startDateRed">Start Date (Red Polyline):</label>
        <input type="datetime-local" v-model="startDateRed" @change="filterPoints" />
  
        <label for="endDateRed">End Date (Red Polyline):</label>
        <input type="datetime-local" v-model="endDateRed" @change="filterPoints" />
        <button class="red" @click="toggleRedPolylineVisibility">
          {{ redVisible ? 'Hide Red Polyline' : 'Show Red Polyline' }}
        </button>
        </div>
    </div>
  
      
  
      <!-- Map -->
      <div id="map" style="height: 600px;"></div>
    </div>
  </template>
  
  <script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReconnectingWebSocket from "reconnecting-websocket";
import omarIcon from "/omar.jpeg";
export default {
  name: "DynamicPolylineMap",
  data() {
    return {
      map: null,
      bluePolyline: null,
      redPolyline: null,
      blueCoordinates: [],
      redCoordinates: [],
      blueVisible: true,
      redVisible: true,
      blueLastPointMarker: null,
      redLastPointMarker: null,
    };
  },
  mounted() {
    this.initializeMap();
    this.fetchCoordinates();
    this.setupWebSocket();
  },
  methods: {
    initializeMap() {
      this.map = L.map("map").setView([37.77, -122.43], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);
    },
    fetchCoordinates() {
      fetch("http://localhost:3000/coordinates")
        .then((response) => response.json())
        .then((data) => {
          this.blueCoordinates = data.blue;
          this.redCoordinates = data.red;
          this.addPolylines();
        });
    },
    addPolylines() {
      const blueLatLngs = this.blueCoordinates.map((point) => [point.lat, point.lng]);
      this.bluePolyline = L.polyline(blueLatLngs, { color: "blue" }).addTo(this.map);

      const redLatLngs = this.redCoordinates.map((point) => [point.lat, point.lng]);
      this.redPolyline = L.polyline(redLatLngs, { color: "red" }).addTo(this.map);

      this.addLastPointMarker(this.blueCoordinates, "blue");
      this.addLastPointMarker(this.redCoordinates, "red");
    },
    setupWebSocket() {
      const ws = new ReconnectingWebSocket("ws://localhost:3000");

      ws.addEventListener("message", (event) => {
        const { blue, red } = JSON.parse(event.data);

        this.blueCoordinates.push(blue);
        this.redCoordinates.push(red);

        // Update blue polyline
        if (this.blueVisible) {
          this.bluePolyline.addLatLng([blue.lat, blue.lng]);
          this.addLastPointMarker(this.blueCoordinates, "blue");
        }

        // Update red polyline
        if (this.redVisible) {
          this.redPolyline.addLatLng([red.lat, red.lng]);
          this.addLastPointMarker(this.redCoordinates, "red");
        }
      });
    },
    addLastPointMarker(coordinates, polylineColor) {
  // Remove previous last point marker
  if (polylineColor === "blue" && this.blueLastPointMarker) {
    this.map.removeLayer(this.blueLastPointMarker);
  } else if (polylineColor === "red" && this.redLastPointMarker) {
    this.map.removeLayer(this.redLastPointMarker);
  }

  const lastPoint = coordinates[coordinates.length - 1];
  if (lastPoint) {
    // Define the custom icon
    const customIcon = L.icon({
      iconUrl: omarIcon, // Use imported asset
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    // Add the marker with the custom icon
    const marker = L.marker([lastPoint.lat, lastPoint.lng], {
      icon: customIcon,
    }).addTo(this.map);

    if (polylineColor === "blue") {
      this.blueLastPointMarker = marker;
    } else if (polylineColor === "red") {
      this.redLastPointMarker = marker;
    }
  }
}
    ,
  },
};
  </script>
  
  <style>
  #map {
    width: 100%;
    height: 600px;
  }

  .red {
    background-color: red;
    padding: 5px;
  }

  .blue {
    background-color: blue;
    padding: 5px;
  }
  </style>
  