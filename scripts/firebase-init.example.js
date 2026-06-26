/**
 * Firebase initialization.
 * Loads all required Firebase modules and exposes them as window variables
 * so that non-module scripts (auth.js etc.) can access them.
 * Dispatches a "firebaseReady" event once everything is set up.
 *
 * SETUP: Copy this file to firebase-init.js and fill in your Firebase config.
 * firebase-init.js is listed in .gitignore and must never be committed.
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

// Firebase config — get these values from your Firebase project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

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

window.firebaseRtdb = rtdb;
window.fbRtdbRef = ref;
window.fbRtdbGet = get;
window.fbRtdbSet = set;
window.fbRtdbRemove = remove;
window.fbRtdbOnValue = onValue;

window.firebaseReady = true;
window.dispatchEvent(new Event("firebaseReady"));

console.log("Firebase initialized successfully");
