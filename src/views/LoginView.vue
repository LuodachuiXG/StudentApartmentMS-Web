<script setup lang="ts">
import { ref } from "vue";
import { login } from "../api/userApi.ts";
import { ElMessage } from "element-plus";
import { LoginModeEnum } from "../models/LoginModeEnum.ts";
import { StoreEnum } from "../models/StoreEnum.ts";
import { useRouter } from "vue-router";


// 工号（学号）
const id = ref('');
// 密码
const password = ref('');

// 当前的模式：login（登录）、register（注册）
const currentMode = ref(LoginModeEnum.LOGIN);

// 路由
const router = useRouter();

/**
 * 登录用户
 */
const onLogin = () => {
  if (id.value.length === 0 || password.value.length === 0) {
    // 弹出通知框
    ElMessage({
      message: '请将工号（学号）或密码填写完整',
      duration: 2000,
      type: 'error'
    });
    return;
  }
  login(id.value, password.value).then((res) => {
    // 登录成功，将用户信息存储
    localStorage.setItem(StoreEnum.USER, JSON.stringify(res.data));
    // 跳转主页
    router.push('main');
  }).catch((err) => {
    console.log(err);
    ElMessage({
      message: err.errMsg,
      duration: 2000,
      type: 'error'
    });
  });

}
</script>

<template>
  <div class="container">
    <el-card class="login-card">
      <div class="card-container">
        <p class="title">{{ currentMode === LoginModeEnum.LOGIN ? '登录' : '注册' }} SAMS</p>
        <!-- 登录 -->
        <div v-if="currentMode === LoginModeEnum.LOGIN">
          <div class="inputs">
            <el-input v-model="id" placeholder="请输入工号（学号）"></el-input>
            <el-input style="margin-top: 20px;" show-password v-model="password" placeholder="密码"
              type="password"></el-input>
          </div>
          <div class="options">
            <el-text class="option" type="primary" @click="currentMode = LoginModeEnum.REGISTER">管理员注册</el-text>
          </div>
          <el-button class="button" type="primary" @click="onLogin()">登录</el-button>
        </div>

        <!-- 注册 -->
        <div v-else-if="currentMode === LoginModeEnum.REGISTER">
          <div class="options">
            <el-text class="option" type="primary" @click="currentMode = LoginModeEnum.LOGIN">返回</el-text>
          </div>
        </div>

      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.login-card {
  width: 400px;
}

.login-card .title {
  font-size: 1.5em;
}

.inputs {
  margin-top: 20px;
}

.options {
  text-align: right;
  margin-top: 10px;
}

.options .option {
  cursor: pointer;
}


.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 80vh;
}

.button {
  margin-top: 10px;
  width: 100%;
}

.card-container {
  margin: 10px;
}
</style>