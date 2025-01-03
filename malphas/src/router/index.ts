import {createRouter, createWebHistory} from 'vue-router'
import CircuitEditor from "@/views/CircuitEditor.vue";
import Dashboard from "@/views/Dashboard.vue";
import Authentication from "@/views/Authentication.vue";

const router = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: [
                {
                        path: '/',
                        redirect: '/auth'
                },
                {
                        path: '/auth',
                        name: 'auth',
                        component: Authentication,
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
