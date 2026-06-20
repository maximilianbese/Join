/**
 * Firebase initialization.
 * Loads all required Firebase modules and exposes them as window variables
 * so that non-module scripts (auth.js etc.) can access them.
 * Dispatches a "firebaseReady" event once everything is set up.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase config (this file is listed in .gitignore)
const firebaseConfig = {
  apiKey: "AIzaSyBHqa_CLHtmRozEDwMfNgldqsy0x5Kvf6Y",
  authDomain: "join-f047f.firebaseapp.com",
  databaseURL:
    "https://join-f047f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-f047f",
  storageBucket: "join-f047f.firebasestorage.app",
  messagingSenderId: "1050906462800",
  appId: "1:1050906462800:web:aca18b3c3e55e7af169f55",
  measurementId: "G-4H7NR1T9V9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Expose Firestore and Auth as window variables
window.firebaseAuth = auth;
window.firebaseDb = db;

window.fbSignIn = signInWithEmailAndPassword;
window.fbCreateUser = createUserWithEmailAndPassword;
window.fbSignInAnon = signInAnonymously;
window.fbSignOut = signOut;
window.fbUpdateProfile = updateProfile;

window.fbDoc = doc;
window.fbGetDoc = getDoc;
window.fbSetDoc = setDoc;
window.fbCollection = collection;
window.fbGetDocs = getDocs;
window.fbWriteBatch = writeBatch;
window.fbDeleteDoc = deleteDoc;

// Expose Realtime Database as window variables
window.firebaseRtdb = rtdb;
window.fbRtdbRef = ref;
window.fbRtdbGet = get;
window.fbRtdbSet = set;
window.fbRtdbRemove = remove;
window.fbRtdbOnValue = onValue;

// Signal: Firebase is ready
window.firebaseReady = true;
window.dispatchEvent(new Event("firebaseReady"));

console.log("Firebase initialized successfully");
