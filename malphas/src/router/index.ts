import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '../views/Login.vue'
import CircuitEditor from "@/views/CircuitEditor.vue";
import Dashboard from "@/views/Dashboard.vue";
import Register from "@/views/Register.vue";

const router = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: [
                {
                        path: '/login',
                        name: 'login',
                        component: LoginView,
                },
                {
                        path: '/register',
                        name: 'register',
                        component: Register
                },
                {
                        path: "/dash",
                        name: 'dash',
                        component: Dashboard
                },
                {
                        path: "/editor",
                        name: 'editor',
                        component: CircuitEditor
                }
        ],
})

export default router
