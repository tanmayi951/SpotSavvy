const express = require("express");
const router = express.Router();
const db = require("./db");

// GET /api/analytics/overview - city-wide parking analytics
router.get("/overview", (req, res) => {
  const allSpots = db.getAllSpots();
  const allLots = db.getAllLots();
  const log = db.getAnalyticsLog();

  const totalSpots = allSpots.length;
  const availableSpots = allSpots.filter((s) => s.status === "available").length;
  const occupiedSpots = allSpots.filter((s) => s.status === "occupied").length;
  const reservedSpots = allSpots.filter((s) => s.status === "reserved").length;
  const occupancyRate = ((occupiedSpots + reservedSpots) / totalSpots * 100).toFixed(1);

  const perLot = allLots.map((lot) => {
    const spots = db.getSpotsForLot(lot.id);
    const available = spots.filter((s) => s.status === "available").length;
    const occupied = spots.filter((s) => s.status === "occupied").length;

    return {
      lotId: lot.id,
      lotName: lot.name,
      totalSpots: lot.totalSpots,
      available,
      occupied,
      occupancyRate: ((occupied / lot.totalSpots) * 100).toFixed(1) + "%",
    };
  });

  // Event counts from analytics log
  const events = log.reduce((acc, entry) => {
    acc[entry.event] = (acc[entry.event] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    overview: {
      totalSpots,
      availableSpots,
      occupiedSpots,
      reservedSpots,
      occupancyRate: occupancyRate + "%",
    },
    perLot,
    eventCounts: events,
    totalLogEntries: log.length,
  });
});

// GET /api/analytics/demand - peak demand prediction (simulated)
router.get("/demand", (req, res) => {
  // Simulated hourly demand prediction for next 10 hours
  const currentHour = new Date().getHours();
  const prediction = [];

  for (let i = 0; i < 10; i++) {
    const hour = (currentHour + i) % 24;
    // Simulate demand: peak at 9-11am and 5-7pm
    let demandLevel;
    if ((hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19)) {
      demandLevel = "high";
    } else if ((hour >= 7 && hour <= 8) || (hour >= 12 && hour <= 16)) {
      demandLevel = "medium";
    } else {
      demandLevel = "low";
    }

    prediction.push({
      hour: `${hour}:00`,
      demandLevel,
      estimatedOccupancy: demandLevel === "high" ? "85-95%" : demandLevel === "medium" ? "50-70%" : "10-30%",
    });
  }

  res.json({
    success: true,
    message: "Parking demand prediction for next 10 hours",
    prediction,
  });
});

module.exports = router;
