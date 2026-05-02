import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ WICHTIG: Mindest-Route für Render
app.get("/", (req, res) => {
  res.send("Wirtschaftsspiel-Server läuft ✅");
});

// Socket.IO – vorbereitet für Multiplayer
io.on("connection", (socket) => {
  console.log("Spieler verbunden:", socket.id);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});
``
