<script setup lang="ts">
import {RoleEnum} from '../models/RoleEnum';
import {StoreEnum} from '../models/StoreEnum';
import {User} from '../models/User';

const user = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;

</script>

<template>
  <el-text class="title">你好，{{ user.name }}{{ user.role === RoleEnum.ADMIN ? '老师' : '同学' }}</el-text>
  <br>
  <el-text class="title">上次登录时间：{{ user.lastLogin }}</el-text>
</template>

<style scoped lang="scss">
.title {
  font-size: 2em;
}
</style>