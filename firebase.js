// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6EpNkKwtVLg5znjJEuFYh76yJLfou2C8",
  authDomain: "login-auth-b7964.firebaseapp.com",
  projectId: "login-auth-b7964",
  storageBucket: "login-auth-b7964.firebasestorage.app",
  messagingSenderId: "670884552934",
  appId: "1:670884552934:web:519462e3ed178aff101b27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;