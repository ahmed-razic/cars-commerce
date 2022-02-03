// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBpYgM35W_gWViEjdiQr5DkcbD_ZeHLVyw',
  authDomain: 'cars-commerce-9ebb7.firebaseapp.com',
  projectId: 'cars-commerce-9ebb7',
  storageBucket: 'cars-commerce-9ebb7.appspot.com',
  messagingSenderId: '185285069620',
  appId: '1:185285069620:web:169c5e5325ae44665ab361',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
