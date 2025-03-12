// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvdBZBGuFULjxGmmz_gQVeQGOyXz546p0",
  authDomain: "docsclone-5cd41.firebaseapp.com",
  projectId: "docsclone-5cd41",
  storageBucket: "docsclone-5cd41.firebasestorage.app",
  messagingSenderId: "604691023899",
  appId: "1:604691023899:web:92e522715a2f3c528210be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);