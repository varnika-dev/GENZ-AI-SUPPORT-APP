// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-v346HBUQum6TBKQ-T-UkVFVDGovnpLg",
  authDomain: "chatbot-bd9e7.firebaseapp.com",
  databaseURL: "https://chatbot-bd9e7-default-rtdb.firebaseio.com",
  projectId: "chatbot-bd9e7",
  storageBucket: "chatbot-bd9e7.appspot.com",
  messagingSenderId: "451859934882",
  appId: "1:451859934882:web:691e2211693b354633b1fb",
  measurementId: "G-J7VTTH9WM2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, signInWithPopup, GoogleAuthProvider, signOut, provider };