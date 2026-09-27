// Load after the firebase-app/auth/firestore compat SDK scripts.
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
// Only pages that also load firebase-storage-compat.js get a storage client
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;
