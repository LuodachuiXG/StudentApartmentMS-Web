<script setup lang="ts">
import { ref } from "vue";
import { login, register } from "../api/userApi.ts";
import { LoginModeEnum } from "../models/LoginModeEnum.ts";
import { StoreEnum } from "../models/StoreEnum.ts";
import { useRouter } from "vue-router";
import { errorMsg, formatDate, successMsg } from "../utils/MyUtils";
import { GenderEnum } from "../models/GenderEnum";
import { User } from "../models/User";
import { RoleEnum } from "../models/RoleEnum";
import { RouterViews } from "../router/RouterViews";

// 定义自定义事件，用于在父页 App.vue 中打开修改密码对话框
const emit = defineEmits([
  'openUpdatePasswordDialog'
]);

// 工号（学号）
const id = ref('');
// 密码
const password = ref('');

// 当前的模式：login（登录）、register（注册）
const currentMode = ref(LoginModeEnum.LOGIN);

// 路由
const router = useRouter();

// 注册-姓名
const rName = ref('');
// 注册-工号
const rId = ref('');
// 注册-密码
const rPwd = ref('');
const rPwdAgain = ref('');
// 注册-手机号
const rPhone = ref('');
// 注册-性别
const rGender = ref('男');
// 注册-出生日期
const rBirth = ref('');



/**
 * 登录用户
 */
const onLogin = () => {
  if (id.value.length === 0 || password.value.length === 0) {
    // 弹出通知框
    errorMsg('请将工号（学号）或密码填写完整');
    return;
  }
  login(id.value, password.value).then((res) => {
    // 登录成功，将用户信息存储
    let user = res.data as User;
    localStorage.setItem(StoreEnum.USER, JSON.stringify(res.data));

    // 根据上次登录时间是否为空和是否是学生，来弹出消息框让学生修改密码
    // 因为学生默认密码是手机号后 6 位，确保安全需要修改默认密码
    if ((user.lastLogin === null || user.lastLogin.length === 0) &&
      user.role === RoleEnum.STUDENT) {
      emit('openUpdatePasswordDialog');
      // 第一次登录，并且是学生
      errorMsg('为了确保账号安全，请立即修改密码');
    }
    // 跳转主页
    router.push(RouterViews.MAIN);
  }).catch((err) => {
    errorMsg(err);
  });
}

/**
 * 注册用户
 */
const onRegister = () => {
  if (rName.value.length === 0 || rId.value.length === 0 || rPwd.value.length === 0 ||
    rPwdAgain.value.length === 0 || rPhone.value.length === 0 ||
    rBirth.value === null || rBirth.value.length === 0) {
    errorMsg('请将信息填写完整');
    return;
  }

  if (rPwd.value != rPwdAgain.value) {
    errorMsg('两次输入的密码不一致');
    return;
  }

  register(rName.value, rId.value, rPwd.value, rPhone.value,
    rGender.value === '男' ? GenderEnum.MALE : GenderEnum.FEMALE,
    formatDate(new Date(rBirth.value))).then(() => {
      // 注册成功，清空注册信息
      clearRegisterValue();
      // 跳转登录页
      currentMode.value = LoginModeEnum.LOGIN;
      successMsg('注册成功');
    }).catch((err) => {
      errorMsg(err);
    });
}

/**
 * 清空注册用户的数据
 */
const clearRegisterValue = () => {
  rName.value = '';
  rId.value = '';
  rPhone.value = '';
  rGender.value = '男';
  rBirth.value = '';
  rPwd.value = '';
  rPwdAgain.value = '';
}

</script>

<template>
  <div class="container">
    <el-card class="login-card">
      <div class="card-container">
        <p class="title">{{ currentMode === LoginModeEnum.LOGIN ? '登录' : '注册管理员' }}</p>
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
          <el-form class="register-form" label-position="left" label-width="85px">
            <el-form-item label="姓名" required>
              <el-input v-model="rName" placeholder="你的姓名"></el-input>
            </el-form-item>
            <el-form-item label="工号" required>
              <el-input v-model="rId" placeholder="工号"></el-input>
            </el-form-item>
            <el-form-item label="密码" required>
              <el-input v-model="rPwd" show-password placeholder="密码" type="password"></el-input>
            </el-form-item>
            <el-form-item label="重复密码" required>
              <el-input v-model="rPwdAgain" show-password placeholder="重复密码" type="password"></el-input>
            </el-form-item>
            <el-form-item label="手机号" required>
              <el-input v-model="rPhone" placeholder="手机号"></el-input>
            </el-form-item>
            <el-form-item label="性别" required>
              <el-radio-group v-model="rGender">
                <el-radio label="男" />
                <el-radio label="女" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="出生日期" required>
              <el-date-picker v-model="rBirth" placeholder="选择出生日期" style="width: 100%;" />
            </el-form-item>
          </el-form>

          <div class="options">
            <el-text class="option" type="primary" @click="currentMode = LoginModeEnum.LOGIN">返回登录</el-text>
          </div>

          <el-button class="button" type="primary" @click="onRegister()">注册</el-button>

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


.register-form {
  margin-top: 10px;
}
</style>