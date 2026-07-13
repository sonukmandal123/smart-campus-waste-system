// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCevlLcpgWfnHhraL1eEY10ig9WoryQkew",
  authDomain: "ecocampus---scms.firebaseapp.com",
  projectId: "ecocampus---scms",
  storageBucket: "ecocampus---scms.firebasestorage.app",
  messagingSenderId: "929762190066",
  appId: "1:929762190066:web:e0d4b6a87578765351e66b",
  measurementId: "G-F4SW9T3YQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, addDoc };
