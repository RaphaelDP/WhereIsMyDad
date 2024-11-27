<script setup lang="ts">
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

defineProps<{ msg: string }>();

const startTime = ref('2024-11-27 10:00'); // Initial start time
const endTime = ref('2024-11-27 16:30');   // Initial end time

let map: L.Map | null = null;
let markersGroup: L.LayerGroup | null = null;
let polylinesGroup: L.LayerGroup | null = null;

const ip1Line = [
  { lat: 51.752, lng: -1.257, time: '2024-11-27 10:00' },
  { lat: 51.62, lng: -0.5, time: '2024-11-27 12:00' },
  { lat: 80, lng: -0.5, time: '2024-11-27 14:00' },
  { lat: 51.5074, lng: -0.1278, time: '2024-11-27 16:00' },
];

const ip2Line = [
  { lat: 61.752, lng: -1.257, time: '2024-11-27 10:30' },
  { lat: 61.62, lng: -0.5, time: '2024-11-27 12:30' },
  { lat: 80, lng: -0.5, time: '2024-11-27 14:30' },
  { lat: 61.5074, lng: -0.1278, time: '2024-11-27 16:30' },
];

onMounted(() => {
  map = L.map('map').setView([51.505, -0.09], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  updateMap();
});

const updateMap = () => {
  if (!map) return;

  if (markersGroup) {
    map.removeLayer(markersGroup);
  }
  if (polylinesGroup) {
    map.removeLayer(polylinesGroup);
  }

  markersGroup = L.layerGroup();
  polylinesGroup = L.layerGroup();

  const parseTime = (time: string) => new Date(time).getTime();
  const start = parseTime(startTime.value);
  const end = parseTime(endTime.value);

  const addFilteredData = (line, color) => {
    const filteredPoints = line.filter((point) => {
      const pointTime = parseTime(point.time);
      return pointTime >= start && pointTime <= end;
    });

    filteredPoints.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 6,
        color: color,
        fillOpacity: 0.7,
      }).addTo(markersGroup);

      marker.bindPopup(`Time: ${point.time}`).openPopup();
    });

    if (filteredPoints.length > 1) {
      const latlngs = filteredPoints.map((point) => [point.lat, point.lng]);
      const polyline = L.polyline(latlngs, { color, weight: 5 }).addTo(polylinesGroup);
    }
  };

  addFilteredData(ip1Line, 'blue');
  addFilteredData(ip2Line, 'red');

  markersGroup.addTo(map);
  polylinesGroup.addTo(map);
};
</script>

<template>
  <h1>{{ msg }}</h1>
  <div id="map"></div>
  <div class="controls">
    <label>
      Start Time:
      <input type="datetime-local" v-model="startTime" @change="updateMap" />
    </label>
    <label>
      End Time:
      <input type="datetime-local" v-model="endTime" @change="updateMap" />
    </label>
  </div>
</template>

<style>
#map {
  height: 500px;
  width: 100%;
}
.controls {
  margin-top: 10px;
}
.controls label {
  display: inline-block;
  margin-right: 10px;
}
</style>
