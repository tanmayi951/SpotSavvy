const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

// POST /api/reservations - reserve a spot
router.post("/", (req, res) => {
  const { userId, spotId, durationMinutes } = req.body;

  if (!userId || !spotId || !durationMinutes) {
    return res.status(400).json({ success: false, message: "userId, spotId, durationMinutes required" });
  }

  const spot = db.getSpot(spotId);
  if (!spot) return res.status(404).json({ success: false, message: "Spot not found" });
  if (spot.status !== "available") {
    return res.status(409).json({ success: false, message: `Spot is currently ${spot.status}` });
  }

  const lot = db.getLot(spot.lotId);
  const reservedUntil = new Date(Date.now() + durationMinutes * 60000);
  const estimatedCost = Math.ceil((durationMinutes / 60) * lot.pricePerHour);

  const reservation = {
    id: uuidv4(),
    userId,
    spotId,
    lotId: spot.lotId,
    lotName: lot.name,
    spotNumber: spot.number,
    createdAt: new Date().toISOString(),
    reservedUntil: reservedUntil.toISOString(),
    durationMinutes,
    estimatedCost,
    currency: "INR",
    status: "active",
  };

  db.addReservation(reservation);
  db.updateSpot(spotId, { status: "reserved", reservedBy: userId, reservedUntil: reservedUntil.toISOString() });
  db.logAnalytics({ event: "reservation_created", reservationId: reservation.id, spotId, userId });

  res.status(201).json({ success: true, message: "Spot reserved successfully", reservation });
});

// GET /api/reservations/:id - get reservation details
router.get("/:id", (req, res) => {
  const reservation = db.getReservation(req.params.id);
  if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });
  res.json({ success: true, reservation });
});

// DELETE /api/reservations/:id - cancel reservation
router.delete("/:id", (req, res) => {
  const reservation = db.getReservation(req.params.id);
  if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

  db.updateReservation(reservation.id, { status: "cancelled" });
  db.updateSpot(reservation.spotId, { status: "available", reservedBy: null, reservedUntil: null });
  db.logAnalytics({ event: "reservation_cancelled", reservationId: reservation.id });

  res.json({ success: true, message: "Reservation cancelled", reservation: db.getReservation(reservation.id) });
});

module.exports = router;
