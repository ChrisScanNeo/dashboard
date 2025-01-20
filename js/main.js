import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Toggle for testing mode
const testingMode = true; // Set to false to disable the limit

// Fetch Firebase config dynamically
fetch('js/init.json') // Remember, this is the correct path for your setup
  .then((response) => response.json())
  .then((firebaseConfig) => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Calculate the timestamp for 10 minutes ago
    const tenMinutesAgo = Timestamp.fromMillis(Date.now() - 10 * 60 * 1000);

    // Reference the "vehicles" Firestore collection
    const vehicleCollection = collection(db, "vehicles");

    // Define the base query
    let vehicleQuery = query(
      vehicleCollection,
      where("timestamp", ">", tenMinutesAgo),
      orderBy("timestamp", "asc")
    );

    // Apply limit only if testingMode is enabled
    if (testingMode) {
      vehicleQuery = query(vehicleQuery, limit(10));
    }

    // Table body element
    const tableBody = document.querySelector("#vehicleTable tbody");

    // Firestore real-time listener
    onSnapshot(vehicleQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();

          // Append the new record to the table
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${data.license_plate || "N/A"}</td>
            <td>${data.dvla_data.colour || "N/A"}</td>
            <td>${data.dvla_data.make || "N/A"}</td>
            <td>${data.dvla_data.taxStatus || "N/A"}</td>
            <td>${data.dvla_data.motStatus || "N/A"}</td>
            <td>${new Date(data.timestamp.seconds * 1000).toLocaleString()}</td>
          `;
          tableBody.appendChild(row);
        }
      });
    });
  })
  .catch((error) => {
    console.error("Error fetching Firebase config:", error);
  });
