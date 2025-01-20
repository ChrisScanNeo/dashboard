const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./init.json'); // Replace with your service account key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to export Firestore data
async function exportFirestoreData() {
  const data = {};
  const collections = await db.listCollections();

  for (const collection of collections) {
    const snapshot = await collection.get();
    data[collection.id] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  fs.writeFileSync('firestore-export.json', JSON.stringify(data, null, 2));
  console.log('Firestore data exported to firestore-export.json');
}

exportFirestoreData();
