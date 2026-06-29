import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBZq72zRv_ntf6Oo0fw4uZkfgOWKY_zfcM",
  authDomain: "cyberapp-mvp.firebaseapp.com",
  databaseURL: "https://cyberapp-mvp-default-rtdb.firebaseio.com",
  projectId: "cyberapp-mvp",
  storageBucket: "cyberapp-mvp.firebasestorage.app",
  messagingSenderId: "416928120668",
  appId: "1:416928120668:web:8715ae93b3631a198d0b99",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue, get };
