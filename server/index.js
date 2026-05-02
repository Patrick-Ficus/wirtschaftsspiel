import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ Testroute für Render
app.get("/", (req, res) => {
  res.send("✅ Wirtschaftsspiel-Server läuft");
});

const players = {};

io.on("connection", socket => {
  console.log("Spieler verbunden:", socket.id);

  socket.on("join", ({ name }) => {
    players[socket.id] = { name, cash: 1000 };
    console.log(name, "ist beigetreten");

    io.emit("update", players);
  });

  socket.on("decision", ({ price, amount }) => {
    const p = players[socket.id];
    if (!p) return;

    // MINIMAL-Logik: einfache Veränderung
    const delta = Math.round((price - 10) * amount);
    p.cash += delta;

    console.log(p.name, "hat entschieden:", price, amount, "=>", p.cash);

    // ALLE Clients informieren
    io.emit("update", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update", players);
  });
});
