import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhCSxxQtu6IlhiKAYfp99wtvRS_NWA7hk",
  authDomain: "postu-a5f32.firebaseapp.com",
  projectId: "postu-a5f32",
  storageBucket: "postu-a5f32.appspot.com",
  messagingSenderId: "844870733279",
  appId: "1:844870733279:web:15b6acec7a890a4b84086a"

  //apiKey: "AIzaSyCnREznfPh6PCQNx0HSZjOUr1rYy9F9cng",
  //authDomain: "proajob-486e1.firebaseapp.com",
  //projectId: "proajob-486e1",
  //storageBucket: "proajob-486e1.appspot.com",
  //messagingSenderId: "626550562649",
  //appId: "1:626550562649:web:b053158e3ccb14d20ff648"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export { storage };