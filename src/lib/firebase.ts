import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use same config as Landing Page
const firebaseConfig = {
    apiKey: "AIzaSyBE51mEHvRTk18OnF2DaiU9W1agQ4MQXPc",
    authDomain: "dolt-dc182.firebaseapp.com",
    projectId: "dolt-dc182",
    storageBucket: "dolt-dc182.firebasestorage.app",
    messagingSenderId: "445404899981",
    appId: "1:445404899981:web:a1d6562bf39c81cc3d90c4",
    measurementId: "G-32XJXRWD44"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
