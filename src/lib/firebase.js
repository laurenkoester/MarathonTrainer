import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD5cso_iaGI0x574PvfI-mujgI5As4yHso',
  authDomain: 'marathontrainer-67c9e.firebaseapp.com',
  projectId: 'marathontrainer-67c9e',
  storageBucket: 'marathontrainer-67c9e.firebasestorage.app',
  messagingSenderId: '305540833909',
  appId: '1:305540833909:web:4ecdf989dedd21934a4e3c',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
