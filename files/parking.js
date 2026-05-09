const express = require("express");
const router = express.Router();
const db = require("./db");
const { getDistance, getStatusColor, findBestSpot } = require("./parkingAI");

// GET /api/parking/lots - list all parking lots with live availability
router.get("/lots", (req, res) => {
  const lots = db.getAllLots().map((lot) => {
    const allSpots = db.getSpotsForLot(lot.id);
    const available = allSpots.filter((s) => s.status === "available").length;
    const occupied = allSpots.filter((s) => s.status === "occupied").length;
    const reserved = allSpots.filter((s) => s.status === "reserved").length;

    return {
      ...lot,
      availability: {
        total: lot.totalSpots,
        available,
        occupied,
        reserved,
        statusColor: getStatusColor(available, lot.totalSpots),
      },
    };
  });

  res.json({ success: true, lots });
});

// GET /api/parking/map - dynamic map data (green/yellow/red per spot)
router.get("/map", (req, res) => {
  const lots = db.getAllLots().map((lot) => {
    const spots = db.getSpotsForLot(lot.id).map((spot) => ({
      id: spot.id,
      number: spot.number,
      status: spot.status,
      color: spot.status === "available" ? "green" : spot.status === "reserved" ? "yellow" : "red",
    }));

    const availableCount = spots.filter((s) => s.status === "available").length;

    return {
      lotId: lot.id,
      name: lot.name,
      location: lot.location,
      mapColor: getStatusColor(availableCount, lot.totalSpots),
      spots,
    };
  });

  res.json({ success: true, map: lots });
});

// GET /api/parking/recommend?lat=&lng=&destination_lat=&destination_lng= - AI recommendation
router.get("/recommend", (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "Driver location required (lat, lng)" });
  }

  const driverLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

  const recommendations = db
    .getAllLots()
    .map((lot) => {
      const availableSpots = db.getAvailableSpots(lot.id);
      const distanceKm = getDistance(driverLocation, lot.location);
      const distanceM = Math.round(distanceKm * 1000);
      const eta = Math.round((distanceKm / 30) * 60); // assume 30km/h city speed

      // AI score: lower distance + more availability + lower price = better score
      const availabilityScore = availableSpots.length / lot.totalSpots;
      const distanceScore = 1 / (distanceKm + 0.1);
      const priceScore = 1 / lot.pricePerHour;
      const aiScore = (availabilityScore * 0.5 + distanceScore * 0.3 + priceScore * 0.2).toFixed(4);

      return {
        lot,
        availableSpots: availableSpots.length,
        distanceMeters: distanceM,
        etaMinutes: eta,
        pricePerHour: lot.pricePerHour,
        aiScore: parseFloat(aiScore),
      };
    })
    .filter((r) => r.availableSpots > 0)
    .sort((a, b) => b.aiScore - a.aiScore);

  const best = recommendations[0];

  res.json({
    success: true,
    message: best
      ? `Best spot available ${best.distanceMeters}m ahead at ${best.lot.name}`
      : "No available spots found nearby",
    topRecommendation: best || null,
    allOptions: recommendations,
  });
});

// GET /api/parking/nearest?lat=&lng= - nearest available spot
router.get("/nearest", (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: "lat and lng required" });

  const driverLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
  const result = findBestSpot(driverLocation, db.getAllLots(), db);

  if (!result) return res.json({ success: false, message: "No available spots found" });

  res.json({ success: true, ...result });
});

// POST /api/parking/lpr - License Plate Recognition (simulated)
router.post("/lpr", (req, res) => {
  const { lotId, spotId, licensePlate, action } = req.body;

  if (!licensePlate || !spotId || !action) {
    return res.status(400).json({ success: false, message: "licensePlate, spotId, and action required" });
  }

  const spot = db.getSpot(spotId);
  if (!spot) return res.status(404).json({ success: false, message: "Spot not found" });

  if (action === "entry") {
    db.updateSpot(spotId, {
      status: "occupied",
      licensePlate,
      occupiedSince: new Date().toISOString(),
    });
    db.logAnalytics({ event: "vehicle_entry", spotId, licensePlate, lotId });
    return res.json({ success: true, message: `Entry recorded for ${licensePlate}`, spot: db.getSpot(spotId) });
  }

  if (action === "exit") {
    const occupiedSince = new Date(spot.occupiedSince);
    const now = new Date();
    const hoursParked = (now - occupiedSince) / 3600000;
    const lot = db.getLot(spot.lotId);
    const bill = Math.max(lot.pricePerHour, Math.ceil(hoursParked * lot.pricePerHour));

    db.updateSpot(spotId, {
      status: "available",
      licensePlate: null,
      occupiedSince: null,
    });

    db.logAnalytics({ event: "vehicle_exit", spotId, licensePlate, hoursParked: hoursParked.toFixed(2), bill });

    return res.json({
      success: true,
      message: `Exit recorded for ${licensePlate}`,
      billing: {
        hoursParked: hoursParked.toFixed(2),
        ratePerHour: lot.pricePerHour,
        totalBill: bill,
        currency: "INR",
      },
    });
  }

  res.status(400).json({ success: false, message: "action must be 'entry' or 'exit'" });
});

module.exports = router;
