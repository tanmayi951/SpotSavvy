// Broadcasts real-time parking updates to all connected clients
function broadcastParkingUpdate(io, spots) {
  const summary = {
    timestamp: new Date().toISOString(),
    totalSpots: spots.length,
    available: spots.filter((s) => s.status === "available").length,
    occupied: spots.filter((s) => s.status === "occupied").length,
    reserved: spots.filter((s) => s.status === "reserved").length,
    spots: spots.map((s) => ({
      id: s.id,
      lotId: s.lotId,
      number: s.number,
      status: s.status,
      licensePlate: s.licensePlate || null,
      color: s.status === "available" ? "green" : s.status === "reserved" ? "yellow" : "red",
    })),
  };

  io.emit("parking_update", summary);
}

module.exports = { broadcastParkingUpdate };
