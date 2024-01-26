<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { StoreEnum } from './models/StoreEnum';
import { User } from './models/User';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, watch, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { RoleEnum } from './models/RoleEnum';

// 当前路由线路
const route = useRoute();
// 路由控制器
const router = useRouter();

// 当前是否是暗色模式
const isDark = useDark();

// 切换暗色模式
const toggleDark = useToggle(isDark)

// 用户实体类，如果用户已经登录，此处不为 null
const user = ref<User | null>(null);

// 左侧菜单项
const asideMenus = [
  {
    name: '首页',
    pathName: 'main',
    icon: 'House',
    role: null
  },
  // 只有管理员显示此菜单
  {
    name: '用户',
    pathName: 'allUser',
    icon: 'User',
    role: RoleEnum.ADMIN
  },
];

// 左侧菜单项当前选中项
const asideMenuIndex = ref(0);

/**
 * Vue 生命周期挂载
 */
onMounted(() => {
  // 监听路由变化（界面切换）
  watch(route, () => {
    // 页面每次切换，重新读取存储中的用户
    const _user = localStorage.getItem(StoreEnum.USER);
    // 如果存储中的用户不为空，赋值给变量 user
    if (_user != null) {
      user.value = JSON.parse(_user) as User;
    }
  });
});

/**
 * 左侧菜单项改变事件
 * @param i 菜单项索引
 */
const onAsideMenuChange = (i: number) => {
  asideMenuIndex.value = i;
  router.push(asideMenus[i].pathName);
};

/**
 * 注销帐号
 */
const onLogout = () => {
  ElMessageBox.confirm(
    '确定退出登录吗？',
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    localStorage.removeItem(StoreEnum.USER);
    user.value = null;
    router.push('login');
  })
}
</script>

<template>
  <div class="main-layout">
    <!-- 布局容器 -->
    <el-container>
      <!-- 布局 Header -->
      <el-header class="head">
        <el-row>
          <el-col :span="18">
            <p class="title">SAMS 学生公寓管理系统</p>
          </el-col>
          <el-col :span="6">
            <div class="head-right">
              <el-button :icon="isDark ? 'Moon' : 'Sunny'" circle @click="toggleDark()"></el-button>
              <el-dropdown class="user" trigger="click">
                <el-button v-if="user !== null" icon="User" round>
                  {{ user.name }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item icon="Edit">修改密码</el-dropdown-item>
                    <el-dropdown-item icon="User">个人信息</el-dropdown-item>
                    <el-dropdown-item icon="Close" divided @click="onLogout()">注销登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <!-- 布局 Aside -->
        <el-aside v-if="user !== null" class="aside" width="250px">
          <div class="button-container">
            <div class="button-div" v-for="(menu, i) in asideMenus">
              <el-button class="button" :type="asideMenuIndex === i ? 'primary' : ''" size="large"
                :text="asideMenuIndex === i ? false : true" :icon="menu.icon"
                v-if="menu.role === null || (menu.role !== null && menu.role === user.role)"
                @click="onAsideMenuChange(i)">{{ menu.name }}</el-button>
            </div>

          </div>
        </el-aside>
        <!-- 布局 Main -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  height: 100%;
}

.head {
  width: 100%;
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: var(--el-box-shadow-light);
  line-height: 60px;
}

.head .title {
  font-size: 1.2em;
}

.head-right {
  height: 60px;
  line-height: 60px;
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 0 0vw;
}

.head-right .user {
  margin-left: 10px;
}

.aside {
  border-right: 1px solid var(--el-border-color);
  height: 92vh;
  box-shadow: var(--el-box-shadow-light);
  padding: 10px;
}

.aside .button-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-content: stretch;
}

.aside .button-container .button-div {
  margin-top: 10px;
}

.aside .button-container .button-div:first-child {
  margin-top: 0px;
}

.aside .button-container .button {
  width: 100%;
  font-size: 1em;
}
</style>
