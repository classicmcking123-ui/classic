// Shared Firebase initialization. Loaded after the firebase-app/auth/firestore
// compat SDK scripts, before any page-specific script that calls firebase.*.
const firebaseConfig = {
    apiKey: "AIzaSyD_XgylPtO6SwzhYqH9fETTBnVYtOEpFYE",
    authDomain: "aligalialigali-bdce7.firebaseapp.com",
    projectId: "aligalialigali-bdce7",
    storageBucket: "aligalialigali-bdce7.firebasestorage.app",
    messagingSenderId: "586853627921",
    appId: "1:586853627921:web:40aed88db8ce603846d9b0"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// Only pages that also load firebase-storage-compat.js get a working storage client
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;
