// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup,  signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc, deleteDoc, onSnapshot, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAREfErrNqreMGKPzROSYDg2UqFKjXmBvU",
    authDomain: "ivyenglish-chinese-web-project.firebaseapp.com",
    projectId: "ivyenglish-chinese-web-project",
    storageBucket: "ivyenglish-chinese-web-project.firebasestorage.app",
    messagingSenderId: "974411213659",
    appId: "1:974411213659:web:4bf823b46924a9d159487e",
    measurementId: "G-6MXGKCSLSK"
  };

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Khởi tạo Firestore
const googleProvider = new GoogleAuthProvider();


export { auth, db, googleProvider, analytics, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence, onAuthStateChanged, signOut, updateProfile, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc, deleteDoc, onSnapshot, updateDoc, deleteField };