import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", socket => {
  console.log("Spieler verbunden:", socket.id);
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server läuft");
});