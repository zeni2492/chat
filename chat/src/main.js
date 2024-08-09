import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { router } from './routes/router'

createApp(App).use(router).mount('#app')
