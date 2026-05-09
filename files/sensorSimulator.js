const db = require("./db");

// Simulates IoT ground sensors randomly changing spot statuses
function simulateSensorUpdates() {
  const allSpots = db.getAllSpots();

  // Randomly update ~5% of spots each cycle
  const toUpdate = allSpots.filter(() => Math.random() < 0.05);

  toUpdate.forEach((spot) => {
    // Skip reserved spots — they're controlled by app
    if (spot.status === "reserved") return;

    const newStatus = spot.status === "available" ? "occupied" : "available";
    db.updateSpot(spot.id, {
      status: newStatus,
      licensePlate: newStatus === "occupied" ? generatePlate() : null,
      occupiedSince: newStatus === "occupied" ? new Date().toISOString() : null,
    });
  });

  return db.getAllSpots();
}

function generatePlate() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "0123456789";
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `KA${rand(digits)}${rand(digits)} ${rand(letters)}${rand(letters)} ${rand(digits)}${rand(digits)}${rand(digits)}${rand(digits)}`;
}

module.exports = { simulateSensorUpdates };
