import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/database';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.SNOWPACK_PUBLIC_APIKEY,
  authDomain: import.meta.env.SNOWPACK_PUBLIC_AUTH_DOMAIN,
  databaseURL: import.meta.env.SNOWPACK_PUBLIC_DATABASE_URL,
  projectId: import.meta.env.SNOWPACK_PUBLIC_PROJECT_ID,
  storageBucket: import.meta.env.SNOWPACK_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.SNOWPACK_PUBLIC_MESSAGING_SENDER_ID,
  appId: import.meta.env.SNOWPACK_PUBLIC_APP_ID,
  measurementId: import.meta.env.SNOWPACK_PUBLIC_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

export default firebase;
