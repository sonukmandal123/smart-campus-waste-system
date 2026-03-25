// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB1nUfZ1j-WMyFHuubVOvQiAyXEuJGq-AI",
  authDomain: "smart-campus-waste-syste-6f0c6.firebaseapp.com",
  projectId: "smart-campus-waste-syste-6f0c6",
  storageBucket: "smart-campus-waste-syste-6f0c6.firebasestorage.app",
  messagingSenderId: "324227148516",
  appId: "1:324227148516:web:11e70861f450ef370b1af1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, addDoc };
