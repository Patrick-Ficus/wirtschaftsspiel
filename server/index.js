import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// --------- Spielzustand ----------
const players = {};

// --------- Test-Seite ----------
app.get("/", (req, res) => {
  res.send("✅ Wirtschaftsspiel-Server läuft");
});

// --------- Socket.IO ------------
io.on("connection", (socket) => {
  console.log("Spieler verbunden:", socket.id);

  // Spieler tritt bei
  socket.on("join", ({ name }) => {
    players[socket.id] = {
      name,
      cash: 1000,
    };

    console.log(name, "ist beigetreten");
    io.emit("update", players);
  });

  // Spieler sendet Entscheidung
  socket.on("decision", ({ price, amount }) => {
    const p = players[socket.id];
    if (!p) return;

    // Minimal-logische Spielregel (sichtbare Wirkung!)
    const delta = Math.round((price - 10) * amount);
    p.cash += delta;

    console.log(
      "Entscheidung von",
      p.name,
      "Preis:",
      price,
      "Menge:",
      amount,
      "=> Kapital:",
      p.cash
    );

    // ALLE Clients bekommen Update
    io.emit("update", players);
  });

  // Verbindung beendet
  socket.on("disconnect", () => {
    const p = players[socket.id];
    if (p) {
      console.log(p.name, "ist gegangen");
    }
    delete players[socket.id];
    io.emit("update", players);
  });
});

// --------- Server starten --------
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});
