import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import {initializeApp} from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    apiKey: "AIzaSyBlJdYOU6djsGoFnFCKexu3g9sgaG0RtD0",
    authDomain: "chat-670cd.firebaseapp.com",
    databaseURL: "https://chat-670cd-default-rtdb.firebaseio.com",
    projectId: "chat-670cd",
    storageBucket: "chat-670cd.firebasestorage.app",
    messagingSenderId: "621267331718",
    appId: "1:621267331718:web:98964a92f21203bfd63f07",
    measurementId: "G-W0ZQYEFKRK"
  };

const firebase = initializeApp(firebaseConfig)
const db = getDatabase(firebase)

createApp(App).use(router).mount('#app')
