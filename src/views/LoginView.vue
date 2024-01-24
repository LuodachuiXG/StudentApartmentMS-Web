<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter()

const switchM = () => {
  router.push('/main')
}
</script>

<template>
  <div class="container">
    <el-card class="login-card">
      <el-button>s</el-button>
      <el-button @click="switchM()" shadow="always">
        Switch
      </el-button>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.login-card {
  width: 400px;
  height: 400px;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 85vh;
}
</style>