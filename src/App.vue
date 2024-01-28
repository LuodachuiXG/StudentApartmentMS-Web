<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { StoreEnum } from './models/StoreEnum';
import { User } from './models/User';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, watch, ref, reactive, provide } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { RoleEnum } from './models/RoleEnum';
import { RouterEnum } from './router/RouterEnum';
import { deleteUsers, updateUser, updateUserPassword } from './api/userApi';
import { GenderEnum } from './models/GenderEnum';
import { formatDate } from './utils/MyUtils';

// 当前路由线路
const route = useRoute();
// 路由控制器
const router = useRouter();

// 当前是否是暗色模式
const isDark = useDark();

// 切换暗色模式
const toggleDark = useToggle(isDark);

// 用户实体类，如果用户已经登录，此处不为 null
const user = ref<User | null>(null);

// 个人信息对话框是否显示
const dialogUserInfoVisible = ref(false);
// 个人信息对话框表单
const dialogUserInfoForm = reactive({
  userId: -1,
  name: '',
  id: '',
  phone: '',
  gender: '男',
  birth: ''
});

// 修改密码对话框是否显示
const dialogUpdatePasswordVisible = ref(false);
// 修改密码对话框表单
const dialogUpdatePasswordForm = reactive({
  oldPwd: '',
  newPwd: '',
  newPwdAgain: ''
});


// 左侧菜单项当前选中项
const asideMenuIndex = ref(0);
// 左侧菜单项
const asideMenus = [
  {
    name: '首页',
    routerName: RouterEnum.MAIN,
    icon: 'House',
    role: null
  },
  // 只有管理员显示此菜单
  {
    name: '用户',
    routerName: RouterEnum.ALL_USER,
    icon: 'User',
    role: RoleEnum.ADMIN
  },
  {
    name: '留言',
    routerName: RouterEnum.MSG_BOARD,
    icon: 'User',
    role: null
  },
];

/**
 * Vue 生命周期挂载
 * 此方法会在当前页刷新的情况下触发
 */
onMounted(() => {
  // 监听路由变化（界面切换）
  watch(route, () => {
    // 页面每次切换，重新读取存储中的用户
    const _user = localStorage.getItem(StoreEnum.USER);
    // 如果存储中的用户不为空，赋值给变量 user
    if (_user != null) {
      user.value = JSON.parse(_user) as User;
    } else {
      user.value = null;
    }

    // 把当前页与左侧菜单项的页面地址对比，确定左侧菜单当前选项
    // 这里这样做，可以防止直接跳转网址或者刷新网页导致左侧菜单显示异常
    asideMenus.forEach((menu, index) => {
      if (route.path === `/${menu.routerName}`) {
        asideMenuIndex.value = index;
      }
    });
  });
});

/**
 * 左侧菜单项改变事件
 * @param i 菜单项索引
 */
const onAsideMenuChange = (i: number) => {
  // 跳转页面
  router.push(asideMenus[i].routerName);
};

/**
 * 注销登录
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
    router.push(RouterEnum.LOGIN);
  });
}

/**
 * 注销账号（删除当前账号，仅管理员）
 */
const onDelUser = () => {
  ElMessageBox.confirm(
    '此操作将会删除当前账号，此操作不可逆！',
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error',
    }
  ).then(() => {
    ElMessageBox.confirm(
      '确定要删除账号吗？',
      '温馨提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    ).then(() => {
      // 删除当前账号
      deleteUsers(Array.of(user.value!!.userId)).then(() => {
        // 删除账号成功
        ElMessage({
          message: '帐号成功删除',
          duration: 2000,
          type: 'success'
        });
        // 清除登录信息
        localStorage.removeItem(StoreEnum.USER);
        // 跳转登录页
        router.push(RouterEnum.LOGIN);
      }).catch((err) => {
        // 帐号删除失败
        ElMessage({
          message: err.errMsg,
          duration: 2000,
          type: 'error'
        });
      });
    });
  });
}

/**
 * 导航栏菜单“个人信息”点击事件
 */
const onUserInfo = () => {
  // 将当前登录用户信息添加到个人信息表单中
  dialogUserInfoForm.userId = user.value!!.userId;
  dialogUserInfoForm.name = user.value!!.name;
  dialogUserInfoForm.id = user.value!!.id;
  dialogUserInfoForm.phone = user.value!!.phone;
  dialogUserInfoForm.gender = user.value!!.gender === 'MALE' ? '男' : '女';
  dialogUserInfoForm.birth = user.value!!.birth;

  // 打开对话框
  dialogUserInfoVisible.value = true;
}

/**
 * 个人信息对话框保存按钮点击事件
 */
const onDialogUserInfoSaveClick = () => {
  if (dialogUserInfoForm.name.length === 0 || dialogUserInfoForm.id.length === 0 ||
    dialogUserInfoForm.phone.length === 0 || dialogUserInfoForm.gender.length === 0 ||
    dialogUserInfoForm.birth === null || dialogUserInfoForm.birth.length === 0) {
    ElMessage({
      message: '请将信息填写完整',
      duration: 2000,
      type: 'error'
    });
    return;
  }

  // 修改个人信息
  updateUser(dialogUserInfoForm.userId, dialogUserInfoForm.name,
    dialogUserInfoForm.id, '', dialogUserInfoForm.phone,
    dialogUserInfoForm.gender === '男' ? GenderEnum.MALE : GenderEnum.FEMALE,
    formatDate(new Date(dialogUserInfoForm.birth))).then(() => {
      ElMessage({
        message: '修改成功',
        duration: 2000,
        type: 'success'
      });
      // 将新数据写入当前登录的用户缓存
      let mUser = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
      mUser.name = dialogUserInfoForm.name;
      mUser.id = dialogUserInfoForm.id;
      mUser.gender = dialogUserInfoForm.gender === '男' ? GenderEnum.MALE : GenderEnum.FEMALE;
      mUser.phone = dialogUserInfoForm.phone;
      mUser.birth = dialogUserInfoForm.birth;
      localStorage.setItem(StoreEnum.USER, JSON.stringify(mUser));
      user.value = mUser;

      // 修改成功，清空个人信息对话框表单
      clearDialogUserInfoForm()
      // 关闭个人信息对话框
      dialogUserInfoVisible.value = false
    }).catch((err) => {
      ElMessage({
        message: err.errMsg,
        duration: 2000,
        type: 'error'
      });
    });
}

/**
 * 清除个人信息对话框表单数据
 */
const clearDialogUserInfoForm = () => {
  dialogUserInfoForm.userId = -1;
  dialogUserInfoForm.name = '';
  dialogUserInfoForm.id = '';
  dialogUserInfoForm.phone = '';
  dialogUserInfoForm.gender = '男';
  dialogUserInfoForm.birth = '';
}

/**
 * 修改密码对话框保存按钮点击事件
 */
const onDialogUpdatePasswordSaveClick = () => {
  if (dialogUpdatePasswordForm.oldPwd.length === 0 ||
    dialogUpdatePasswordForm.newPwd.length === 0 ||
    dialogUpdatePasswordForm.newPwdAgain.length === 0) {
    ElMessage({
      message: '请将信息填写完整',
      duration: 2000,
      type: 'error'
    });
    return;
  }

  if (dialogUpdatePasswordForm.newPwd !== dialogUpdatePasswordForm.newPwdAgain) {
    ElMessage({
      message: '两次输入的密码不一致',
      duration: 2000,
      type: 'error'
    });
    return;
  }

  // 修改密码
  updateUserPassword(dialogUpdatePasswordForm.oldPwd, dialogUpdatePasswordForm.newPwd).then(() => {
    // 修改密码成功
    ElMessage({
      message: '修改成功',
      duration: 2000,
      type: 'success'
    });
    // 清空修改密码对话框表单
    clearDialogUpdatePasswordForm();
    // 关闭修改密码对话框
    dialogUpdatePasswordVisible.value = false;
  }).catch((err) => {
    // 修改密码失败
    ElMessage({
      message: err.errMsg,
      duration: 2000,
      type: 'error'
    });
  });
}

/**
 * 清除修改密码对话框表单数据
 */
const clearDialogUpdatePasswordForm = () => {
  dialogUpdatePasswordForm.oldPwd = '';
  dialogUpdatePasswordForm.newPwd = '';
  dialogUpdatePasswordForm.newPwdAgain = '';
}

/**
 * 提供一个接口，给其他子页调用，用于打开修改密码对话框
 */
provide('openUpdatePasswordDialog', () => {
  dialogUpdatePasswordVisible.value = true;
});
</script>

<template>
  <div class="main-box">
    <!-- 布局容器 -->
    <el-container class="container" direction="vertical">
      <!-- 布局 Header -->
      <el-header class="head">
        <el-row>
          <el-col :span="18">
            <p class="title">学生公寓管理系统</p>
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
                    <el-dropdown-item icon="Edit" @click="dialogUpdatePasswordVisible = true">修改密码</el-dropdown-item>
                    <el-dropdown-item icon="User" @click="onUserInfo()">个人信息</el-dropdown-item>
                    <el-dropdown-item v-if="user?.role === RoleEnum.ADMIN" icon="Delete" divided
                      @click="onDelUser()">注销帐号</el-dropdown-item>
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
            <div class="button-div" v-for="(menu, i) in asideMenus"
              :style="(menu.role === null || (menu.role !== null && menu.role === user.role)) ? '' : 'display:none;'">
              <el-button class="button" :type="asideMenuIndex === i ? 'primary' : ''" size="large"
                :text="asideMenuIndex === i ? false : true" :icon="menu.icon" @click="onAsideMenuChange(i)"
                auto-insert-space>{{ menu.name }}</el-button>
            </div>

          </div>
        </el-aside>
        <!-- 布局 Main -->
        <el-main class="main">
          <!-- openUpdatePasswordDialog 为 LoginView 子组件事件，用于打开修改密码对话框 -->
          <router-view @openUpdatePasswordDialog="dialogUpdatePasswordVisible = true"></router-view>
        </el-main>
      </el-container>
    </el-container>


    <!-- 个人信息对话框 -->
    <el-dialog v-model="dialogUserInfoVisible" draggable title="个人信息">
      <el-form class="register-form" :model="dialogUserInfoForm" label-position="left" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="dialogUserInfoForm.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item :label="user?.role === RoleEnum.ADMIN ? '工号' : '学号'" required>
          <el-input v-model="dialogUserInfoForm.id" :placeholder="user?.role === RoleEnum.ADMIN ? '工号' : '学号'"></el-input>
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="dialogUserInfoForm.phone" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="dialogUserInfoForm.gender">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" required>
          <el-date-picker v-model="dialogUserInfoForm.birth" placeholder="选择出生日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUserInfoVisible = false">取消</el-button>
          <el-button type="primary" @click="onDialogUserInfoSaveClick">保存</el-button>
        </span>
      </template>
    </el-dialog>


    <!-- 修改密码对话框 -->
    <el-dialog v-model="dialogUpdatePasswordVisible" draggable title="修改密码">
      <el-form class="register-form" :model="dialogUpdatePasswordForm" label-position="left" label-width="100px">
        <el-form-item label="旧密码" required>
          <el-input v-model="dialogUpdatePasswordForm.oldPwd" placeholder="旧密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input v-model="dialogUpdatePasswordForm.newPwd" placeholder="新密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="重复新密码" required>
          <el-input v-model="dialogUpdatePasswordForm.newPwdAgain" placeholder="重复新密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpdatePasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="onDialogUpdatePasswordSaveClick">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.main-box,
.container {
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

.main {
  padding: 10px;
}
</style>
