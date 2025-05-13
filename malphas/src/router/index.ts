import {createRouter, createWebHistory} from 'vue-router'
import CircuitEditor from "@/views/CircuitEditor.vue";
import Dashboard from "@/views/Dashboard.vue";
import Authentication from "@/views/Authentication.vue";
import PathNotFound from "@/views/PathNotFound.vue";

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
                },
                {
                        path: '/:pathMatch(.*)*',
                        component: PathNotFound
                },
        ],
})

router.beforeEach((to, from, next) => {
        const authenticated = document.cookie.includes('malphas_session=')
        if (to.path !== '/dash' && authenticated)
                next('/dash')
        else if (to.path !== '/auth' && !authenticated)
                next('/auth')
        else
                next()
})

export default router
