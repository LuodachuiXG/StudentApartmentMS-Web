import { createRouter, createWebHistory } from 'vue-router';
import { StoreEnum } from '../models/StoreEnum';
import { ElMessage } from "element-plus";
import { RoleEnum } from '../models/RoleEnum';
import { User } from '../models/User';
import { RouterEnum } from './RouterEnum';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/404',
            name: '404',
            component: () => import('../views/NotFoundView.vue')
        },
        {
            path: '/:pathMatch(.*)',
            redirect: '/404'
        },
        {
            path: '/',
            name: RouterEnum.LOGIN,
            component: () => import('../views/LoginView.vue')
        },
        {
            path: `/${RouterEnum.MAIN}`,
            name: RouterEnum.MAIN,
            component: () => import('../views/MainView.vue')
        },
        {
            path: `/${RouterEnum.ALL_USER}`,
            name: RouterEnum.ALL_USER,
            component: () => import('../views/AllUserView.vue'),
            meta: {
                role: RoleEnum.ADMIN
            }
        },
        {
            path: `/${RouterEnum.MSG_BOARD}`,
            name: RouterEnum.MSG_BOARD,
            component: () => import('../views/MainView.vue')
        },
    ]
});

// 导航守卫
router.beforeEach(async (to, _from) => {
    // 未登录的话跳转到登录页面
    if (to.name !== 'login' && localStorage.getItem(StoreEnum.USER) === null) {
        ElMessage({
            message: '登录已过期，请重新登录',
            duration: 2000,
            type: 'error'
        });
        console.log('登录已过期，请重新登录')
        return { name: RouterEnum.LOGIN }
    }

    const viewRole: RoleEnum | undefined = to.meta.role as RoleEnum;
    // 阻止学生访问管理员页面
    if (viewRole !== undefined) {
        const user = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
        if (viewRole != user.role) {
            ElMessage({
                message: `你没有权限访问 ${to.path}`,
                duration: 2000,
                type: 'error'
            });
            return { name: RouterEnum.MAIN }
        }
    }
})


export default router