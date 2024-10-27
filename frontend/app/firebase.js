// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB30m7qotUXpTCt81YBw14VoOQ1wdh32h0",
  authDomain: "bct-material-tracking.firebaseapp.com",
  projectId: "bct-material-tracking",
  storageBucket: "bct-material-tracking.appspot.com",
  messagingSenderId: "197750333208",
  appId: "1:197750333208:web:0b26253f9147eee42ec86d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
