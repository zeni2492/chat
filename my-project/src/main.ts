import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import {initializeApp} from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    
}

const firebase = initializeApp(firebaseConfig)
const db = getDatabase(firebase)

createApp(App).use(router).mount('#app')
