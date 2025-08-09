// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyATOiD3Hp077WyGNi50KFTCxx_yrmuyxf0",
  authDomain: "gratest-cfc14.firebaseapp.com",
  databaseURL: "https://gratest-cfc14-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gratest-cfc14",
  storageBucket: "gratest-cfc14.firebasestorage.app",
  messagingSenderId: "26328738989",
  appId: "1:26328738989:web:18484211ec540a9cf66a24"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
