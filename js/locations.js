import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Fetch Firebase config dynamically
fetch('js/init.json') // Replace with '/__/firebase/init.json' for production
  .then((response) => {
    console.log("Fetching Firebase configuration...");
    return response.json();
  })
  .then((firebaseConfig) => {
    console.log("Firebase config loaded successfully:", firebaseConfig);

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log("Firebase initialized.");

    const db = getFirestore(app);
    console.log("Firestore initialized.");

    // Wait for the DOM to fully load
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM fully loaded.");

      // Load Google Maps dynamically
      const googleMapsScript = document.createElement("script");
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${firebaseConfig.google_maps_api_key}`;
      googleMapsScript.defer = true;

      console.log("Loading Google Maps script...");
      document.head.appendChild(googleMapsScript);

      googleMapsScript.onload = () => {
        console.log("Google Maps script loaded successfully.");

        // Initialize Google Map
        const mapDiv = document.getElementById("map");
        if (!mapDiv) {
          console.error("Map container (#map) not found in DOM.");
          return;
        }

        const map = new google.maps.Map(mapDiv, {
          center: { lat: 51.509865, lng: -0.118092 }, // Default to London
          zoom: 8,
        });
        console.log("Google Map initialized.");

        // Reference the "vehicles" Firestore collection
        const vehicleCollection = collection(db, "vehicles");

        // Query the collection
        const vehicleQuery = query(vehicleCollection);

        console.log("Listening for real-time Firestore updates...");
        onSnapshot(vehicleQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              console.log("New vehicle record added:", data);

              const gpsLocation = data.gps_location;
              if (gpsLocation && gpsLocation.latitude && gpsLocation.longitude) {
                console.log("Adding marker for vehicle:", data.license_plate);

                // Add a marker for the vehicle
                const marker = new google.maps.Marker({
                  position: {
                    lat: gpsLocation.latitude,
                    lng: gpsLocation.longitude,
                  },
                  map: map,
                  title: data.license_plate || "Unknown",
                });

                // Add an info window to display license plate
                const infoWindow = new google.maps.InfoWindow({
                  content: `<strong>${data.license_plate || "Unknown"}</strong>`,
                });

                marker.addListener("click", () => {
                  infoWindow.open(map, marker);
                });
              } else {
                console.warn("Vehicle has no GPS location:", data);
              }
            }
          });
        });
      };

      googleMapsScript.onerror = () => {
        console.error("Failed to load Google Maps script.");
      };
    });
  })
  .catch((error) => {
    console.error("Error fetching Firebase config or initializing app:", error);
  });
