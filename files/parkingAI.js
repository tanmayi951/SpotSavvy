// Haversine formula to calculate distance between two GPS coordinates (in km)
function getDistance(loc1, loc2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Returns map color based on availability ratio
function getStatusColor(available, total) {
  const ratio = available / total;
  if (ratio === 0) return "red";
  if (ratio < 0.3) return "yellow";
  return "green";
}

// Find the best available spot near the driver
function findBestSpot(driverLocation, lots, db) {
  let bestOption = null;
  let bestScore = -1;

  lots.forEach((lot) => {
    const availableSpots = db.getAvailableSpots(lot.id);
    if (availableSpots.length === 0) return;

    const distanceKm = getDistance(driverLocation, lot.location);
    const etaMinutes = Math.round((distanceKm / 30) * 60);
    const spot = availableSpots[0]; // nearest available spot in this lot

    // Score: prioritize close and available
    const score = availableSpots.length / (distanceKm + 0.1);

    if (score > bestScore) {
      bestScore = score;
      bestOption = {
        lot,
        spot,
        distanceMeters: Math.round(distanceKm * 1000),
        etaMinutes,
        availableSpotsInLot: availableSpots.length,
      };
    }
  });

  return bestOption;
}

module.exports = { getDistance, getStatusColor, findBestSpot };
