import { createRouter, createWebHistory } from 'vue-router';
import { StoreEnum } from '../models/StoreEnum';
import { RoleEnum } from '../models/RoleEnum';
import { User } from '../models/User';
import { errorMsg } from '../utils/MyUtils';
import { RouterViews } from './RouterViews';

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
            name: RouterViews.LOGIN,
            component: () => import('../views/LoginView.vue')
        },
        {
            path: `/${RouterViews.MAIN}`,
            name: RouterViews.MAIN,
            component: () => import('../views/MainView.vue')
        },
        {
            path: `/${RouterViews.ALL_USER}`,
            name: RouterViews.ALL_USER,
            component: () => import('../views/AllUserView.vue'),
            meta: {
                role: RoleEnum.ADMIN
            }
        },
        {
            path: `/${RouterViews.DORMITORY}`,
            name: RouterViews.DORMITORY,
            component: () => import('../views/DormitoryView.vue'),
        },
        {
            path: `/${RouterViews.MSG_BOARD}`,
            name: RouterViews.MSG_BOARD,
            component: () => import('../views/MessageBoardView.vue')
        },
    ]
});

// 导航守卫
router.beforeEach(async (to, _from) => {
    // 未登录的话跳转到登录页面
    if (to.name !== 'login' && localStorage.getItem(StoreEnum.USER) === null) {
        errorMsg('登录已过期，请重新登录');
        console.log('登录已过期，请重新登录')
        return { name: RouterViews.LOGIN }
    }

    const viewRole: RoleEnum | undefined = to.meta.role as RoleEnum;
    // 阻止学生访问管理员页面
    if (viewRole !== undefined) {
        const user = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
        if (viewRole != user.role) {
            errorMsg(`你没有权限访问 ${to.path}`)
            return { name: RouterViews.MAIN }
        }
    }
})


export default router