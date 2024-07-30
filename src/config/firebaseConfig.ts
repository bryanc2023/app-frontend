import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnREznfPh6PCQNx0HSZjOUr1rYy9F9cng",
  authDomain: "proajob-486e1.firebaseapp.com",
  projectId: "proajob-486e1",
  storageBucket: "proajob-486e1.appspot.com",
  messagingSenderId: "626550562649",
  appId: "1:626550562649:web:b053158e3ccb14d20ff648"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export { storage };