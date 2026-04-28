import React, { useEffect, useMemo, useState } from 'react';

const initialSpots = [
  { id: 'A1', status: 'available', type: 'Compact', level: '1' },
  { id: 'A2', status: 'occupied', type: 'SUV', level: '1' },
  { id: 'A3', status: 'available', type: 'Electric', level: '1' },
  { id: 'B1', status: 'occupied', type: 'Compact', level: '2' },
  { id: 'B2', status: 'reserved', type: 'Handicap', level: '2' },
  { id: 'B3', status: 'available', type: 'SUV', level: '2' },
  { id: 'C1', status: 'occupied', type: 'Compact', level: '3' },
  { id: 'C2', status: 'available', type: 'Compact', level: '3' },
];

const statusStyles = {
  available: 'status available',
  occupied: 'status occupied',
  reserved: 'status reserved',
};

function App() {
  const [spots, setSpots] = useState(initialSpots);
  const [filter, setFilter] = useState('all');
  const [guidedSpot, setGuidedSpot] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpots((current) =>
        current.map((spot) => {
          if (spot.status === 'reserved') return spot;
          if (Math.random() < 0.18) {
            const nextStatus = spot.status === 'available' ? 'occupied' : 'available';
            return { ...spot, status: nextStatus };
          }
          return spot;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const summary = useMemo(() => {
    return {
      available: spots.filter((spot) => spot.status === 'available').length,
      occupied: spots.filter((spot) => spot.status === 'occupied').length,
      reserved: spots.filter((spot) => spot.status === 'reserved').length,
    };
  }, [spots]);

  const visibleSpots = useMemo(() => {
    if (filter === 'all') return spots;
    return spots.filter((spot) => spot.status === filter);
  }, [filter, spots]);

  const findNearestAvailable = () => {
    const nearest = spots.find((spot) => spot.status === 'available');
    setGuidedSpot(nearest || null);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Smart City Parking</p>
          <h1>SpotSavy Dashboard</h1>
          <p className="subhead">
            Real-time parking availability, quick guidance, and smarter urban flow.
          </p>
        </div>
        <button className="action-button" onClick={findNearestAvailable}>
          Guide me to next spot
        </button>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <h2>{summary.available}</h2>
          <p>Available spots</p>
        </article>
        <article className="summary-card">
          <h2>{summary.occupied}</h2>
          <p>Occupied spots</p>
        </article>
        <article className="summary-card">
          <h2>{summary.reserved}</h2>
          <p>Reserved spots</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel map-panel">
          <div className="panel-header">
            <h2>Parking Map</h2>
            <span className="badge">Live update</span>
          </div>
          <div className="map-placeholder">
            <div className="map-overlay">
              <p>Map view placeholder</p>
              <p>Integrate with real APIs, sensors, or camera detection here.</p>
            </div>
          </div>
        </article>

        <article className="panel list-panel">
          <div className="panel-header">
            <div>
              <h2>Spot Availability</h2>
              <p>Filter by status to find the best match quickly.</p>
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All spots</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="spot-list">
            {visibleSpots.map((spot) => (
              <div key={spot.id} className="spot-card">
                <div>
                  <h3>{spot.id}</h3>
                  <p>{spot.type} • Level {spot.level}</p>
                </div>
                <span className={statusStyles[spot.status]}>{spot.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="footer-note">
        {guidedSpot ? (
          <p>
            Nearest available spot: <strong>{guidedSpot.id}</strong> on Level{' '}
            <strong>{guidedSpot.level}</strong>.
          </p>
        ) : (
          <p>Press the guide button for the best available parking recommendation.</p>
        )}
      </footer>
    </div>
  );
}

export default App;
