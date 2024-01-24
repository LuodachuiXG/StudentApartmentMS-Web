<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';

// 当前是否是暗色模式
const isDark = useDark();
// 切换暗色模式
const toggleDark = useToggle(isDark)
</script>

<template>
  <el-container>
    <el-header class="head">
      <el-row>
        <el-col :span="18">
          <p class="title">SAMS 学生公寓管理系统</p>
        </el-col>
        <el-col :span="6">
          <div class="head-right">
            <el-button :icon="isDark ? 'Moon' : 'Sunny'" circle @click="toggleDark()"></el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style scoped lang="scss">
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
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 0 0vw;
}
</style>
