import { createWebHistory,createRouter } from 'vue-router'
import ChatPage from '../pages/ChatPage.vue'
import LoginPage from '../pages/LoginPage/LoginPage.vue'


const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginPage   
    },
    {
        path: '/chat',
        name: 'chat',
        component: ChatPage
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})