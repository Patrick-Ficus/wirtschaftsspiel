
import React, { useEffect, useState } from "react";
// === Einfaches echtes Multiplayer ohne Server === // Nutzung des Browser-BroadcastChannel (funktioniert mit mehreren Tabs/PCs im selben Raum) const channel = new BroadcastChannel("eco-game-v1");const MAX_PLAYERS = 16;
const initialPlayer = (id, name) => ({ id, name, price: 10, production: 20, rnd: 0, loan: 0, cash: 1000, lastProfit: 0 });export default function Wirtschaftsspiel() { const [me, setMe] = useState(null); const [players, setPlayers] = useState({}); const [round, setRound] = useState(1); const [economy, setEconomy] = useState({ demandFactor: 1 }); const [isTeacher, setIsTeacher] = useState(false);
// Empfang von Updates useEffect(() => { channel.onmessage = (e) => { const msg = e.data; if (msg.type === "STATE") { setPlayers(msg.players); setRound(msg.round); setEconomy(msg.economy); } }; }, []);
// Login if (!me) { return ( 
🏭 Wirtschaftsplanspiel
<button className="bg-blue-600 text-white px-4 py-2 w-full mb-2" onClick={() => { const name = document.getElementById("name").value; const id = Math.random().toString(36).slice(2); setMe({ id, name }); channel.postMessage({ type: "JOIN", player: initialPlayer(id, name) }); }}>Beitreten <button className="text-sm underline" onClick={() => setIsTeacher(true)}>Als Lehrkraft
); }
// === Spieler-Ansicht === if (!isTeacher) { const p = players[me.id] || initialPlayer(me.id, me.name); return ( 
Firma: {p.name}
Runde: {round}
Kapital: {p.cash.toFixed(0)} €
Letzter Gewinn: {p.lastProfit.toFixed(0)} €
    <div className="grid grid-cols-2 gap-2 mt-4">
      <label>Preis <input type="number" value={p.price} onChange={e => updateMe({ price: +e.target.value })} /></label>
      <label>Menge <input type="number" value={p.production} onChange={e => updateMe({ production: +e.target.value })} /></label>
      <label>F&E <input type="number" value={p.rnd} onChange={e => updateMe({ rnd: +e.target.value })} /></label>
      <label>Kredit <input type="number" value={p.loan} onChange={e => updateMe({ loan: +e.target.value })} /></label>
    </div>
    <p className="mt-4 text-sm">Warte auf nächste Runde…</p>
  </div>
);
}
// === Lehrer-Desk === return ( 
🎓 Lehrer-Desk
Runde: {round}
  <button className="bg-green-600 text-white px-4 py-2 block my-4" onClick={nextRound}>➡️ Nächste Runde berechnen</button>

  <table className="w-full border">
    <thead><tr><th>Name</th><th>Preis</th><th>Menge</th><th>Umsatz</th><th>Gewinn</th><th>Kapital</th></tr></thead>
    <tbody>
      {Object.values(players).map(p => (
        <tr key={p.id}>
          <td>{p.name}</td>
          <td>{p.price}</td>
          <td>{p.production}</td>
          <td>{(p.price * p.production).toFixed(0)}</td>
          <td>{p.lastProfit.toFixed(0)}</td>
          <td>{p.cash.toFixed(0)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
);
// === Hilfsfunktionen === function updateMe(changes) { channel.postMessage({ type: "UPDATE", id: me.id, changes }); }
function nextRound() { const newPlayers = { ...players };
// Angebots- & Nachfrage-Logik (vereinfacht)
const totalSupply = Object.values(newPlayers).reduce((s, p) => s + p.production, 0);
Object.values(newPlayers).forEach(p => {
  const demand = economy.demandFactor * 100 / p.price;
  const sold = Math.min(p.production, demand * (1 / totalSupply) * 100);
  const revenue = sold * p.price;
  const costs = p.production * 3 + p.rnd + p.loan * 0.05;
  const profit = revenue - costs;
  p.cash += profit;
  p.lastProfit = profit;
});

channel.postMessage({
  type: "STATE",
  players: newPlayers,
  round: round + 1,  economy
});
} }
