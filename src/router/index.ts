import { createRouter, createWebHistory } from 'vue-router'
import { StoreEnum } from '../models/StoreEnum';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/main',
            name: 'main',
            component: () => import('../views/MainView.vue')
        }
    ]
});

// 导航守卫，未登录的话跳转到登录页面
router.beforeEach(async (to, _from) => {
    if (to.name !== 'login' && localStorage.getItem(StoreEnum.USER) === null) {
        console.log('未登录，请先登录')
        return { name: 'login' }
    }
})
 

export default router