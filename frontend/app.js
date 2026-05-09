// Example: Fetching parking data from your backend
async function getParkingSpots() {
  try {
    const response = await fetch('http://localhost:3000/api/parking/lots');
    const data = await response.json();
    
    console.log("Parking Spots:", data);
    // Here you would update your UI with the data
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

getParkingSpots();
