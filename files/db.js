// Simple in-memory database (replace with Firebase/MongoDB in production)

const parkingLots = {
  LOT_A: {
    id: "LOT_A",
    name: "City Mall Parking",
    location: { lat: 12.9716, lng: 77.5946 },
    totalSpots: 50,
    pricePerHour: 30, // INR
  },
  LOT_B: {
    id: "LOT_B",
    name: "Airport Parking",
    location: { lat: 13.1989, lng: 77.7068 },
    totalSpots: 100,
    pricePerHour: 60,
  },
  LOT_C: {
    id: "LOT_C",
    name: "University Campus Parking",
    location: { lat: 12.9352, lng: 77.6245 },
    totalSpots: 30,
    pricePerHour: 10,
  },
};

// Generate individual parking spots for each lot
const spots = {};

Object.values(parkingLots).forEach((lot) => {
  for (let i = 1; i <= lot.totalSpots; i++) {
    const spotId = `${lot.id}_SPOT_${i}`;
    spots[spotId] = {
      id: spotId,
      lotId: lot.id,
      number: i,
      status: Math.random() > 0.4 ? "occupied" : "available", // random initial state
      licensePlate: null,
      occupiedSince: null,
      reservedBy: null,
      reservedUntil: null,
    };
  }
});

// Reservations store
const reservations = {};

// Payments store
const payments = {};

// Analytics store
const analyticsLog = [];

module.exports = {
  getLot: (lotId) => parkingLots[lotId],
  getAllLots: () => Object.values(parkingLots),

  getSpot: (spotId) => spots[spotId],
  getAllSpots: () => Object.values(spots),
  getSpotsForLot: (lotId) => Object.values(spots).filter((s) => s.lotId === lotId),
  updateSpot: (spotId, updates) => {
    if (spots[spotId]) {
      spots[spotId] = { ...spots[spotId], ...updates };
    }
    return spots[spotId];
  },

  getAvailableSpots: (lotId) => {
    const list = lotId
      ? Object.values(spots).filter((s) => s.lotId === lotId && s.status === "available")
      : Object.values(spots).filter((s) => s.status === "available");
    return list;
  },

  getReservation: (id) => reservations[id],
  addReservation: (res) => {
    reservations[res.id] = res;
    return res;
  },
  updateReservation: (id, updates) => {
    if (reservations[id]) reservations[id] = { ...reservations[id], ...updates };
    return reservations[id];
  },
  getAllReservations: () => Object.values(reservations),

  addPayment: (payment) => {
    payments[payment.id] = payment;
    return payment;
  },
  getPayment: (id) => payments[id],

  logAnalytics: (entry) => analyticsLog.push({ ...entry, timestamp: new Date() }),
  getAnalyticsLog: () => analyticsLog,
};
