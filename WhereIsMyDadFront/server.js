import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;

app.use(cors());

let blueCoordinates = [
  { lat: 45.51, lng: -122.68, time: new Date().toISOString() },
];
let redCoordinates = [
  { lat: 37.80, lng: -122.47, time: new Date().toISOString() },
];

// Serve initial coordinates
app.get('/coordinates', (req, res) => {
  res.json({ blue: blueCoordinates, red: redCoordinates });
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send new coordinates every 2 seconds
  const interval = setInterval(() => {
    const lastBluePoint = blueCoordinates[blueCoordinates.length - 1];
    const lastRedPoint = redCoordinates[redCoordinates.length - 1];

    const newBluePoint = {
      lat: lastBluePoint.lat + (Math.random() - 0.5) ,
      lng: lastBluePoint.lng + (Math.random() - 0.5) ,
      time: new Date().toISOString(),
    };
    const newRedPoint = {
      lat: lastRedPoint.lat + (Math.random() - 0.5) ,
      lng: lastRedPoint.lng + (Math.random() - 0.5) ,
      time: new Date().toISOString(),
    };

    blueCoordinates.push(newBluePoint);
    redCoordinates.push(newRedPoint);

    ws.send(
      JSON.stringify({
        blue: newBluePoint,
        red: newRedPoint,
      })
    );
  }, 2000);

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval)})
  })