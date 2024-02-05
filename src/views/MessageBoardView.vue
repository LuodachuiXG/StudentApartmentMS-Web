<script setup lang="ts">
// 存储留言分页数据
import {onMounted, ref} from "vue";
import {Pager} from "../models/Pager.ts";
import {MessageBoard} from "../models/MessageBoard.ts";
import {User} from "../models/User.ts";
import {StoreEnum} from "../models/StoreEnum.ts";
import {RoleEnum} from "../models/RoleEnum.ts";
import {Dorm} from "../models/Dorm.ts";
import {getDormsByAdmin} from "../api/dormApi.ts";
import {errorMsg} from "../utils/MyUtils.ts";
import {getMsgByPage} from "../api/msgApi.ts";
import {Top} from "@element-plus/icons-vue";

const pages = ref<Pager<MessageBoard> | null>(null);

// 分页器每页条数
const pageSize = ref(10);

// 分页器当前页数
const currentPage = ref(1);

// 当前登录用户实体类
const user = ref<User>();

// 当前管理员管理的宿舍楼
const dorms = ref<Array<Dorm>>();

// 当前管理员选择的宿舍
const currentSelectDormId = ref<number>();

/**
 * Vue 生命周期挂载
 */
onMounted(() => {
  // 获取当前登录用户
  user.value = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
  // 初始化当前页面基本数据
  init();
});


/**
 * 初始化当前页面基本数据
 */
const init = () => {
  // 如果当前登录用户是管理员
  if (user.value?.role === RoleEnum.ADMIN) {
    // 获取当前管理员管理的宿舍楼，管理员选择管理的宿舍后再获取当前宿舍的留言
    getDormsByAdmin(user.value?.userId).then((res) => {
      dorms.value = res.data as Array<Dorm>;
    }).catch((err) => {
      errorMsg(err);
    });
  }
}

/**
 * 根据当前选择的宿舍 ID 获取当前宿舍的留言
 */
const refreshDormMsg = () => {
  getMsgByPage(currentSelectDormId.value!!, currentPage.value, pageSize.value).then((res) => {
    pages.value = res.data;
    console.log(pages.value)
  }).catch((err) => {
    errorMsg(err);
  });
}


/**
 * 表格每页条数改变事件
 */
const onTableSizeChangChange = (value: number) => {
  pageSize.value = value;
  // 刷新留言数据

}

/**
 * 表格当前页数改变事件
 */
const onTableCurrentPageChange = (value: number) => {
  currentPage.value = value;
  // 刷新留言数据

}

/**
 * 管理员选择管理的宿舍选择器选项改变事件
 */
const onSelectAdminDormChange = () => {
  // 根据当前选择的宿舍 ID 获取当前宿舍所有留言
  refreshDormMsg();
}


</script>

<template>
  <div class="container">
    <div class="button-group">
      <!-- 管理员选择自己管理的宿舍 -->
      <el-select
          v-model="currentSelectDormId"
          placeholder="选择你管理的宿舍"
          style="width: 240px"
          no-data-text="你没有管理任何宿舍"
          @change="onSelectAdminDormChange">
        <el-option
            v-for="dorm in dorms"
            :key="dorm.dormitoryId"
            :label="dorm.name"
            :value="dorm.dormitoryId"
        />
      </el-select>
    </div>

    <!-- 展示所有留言 -->
    <div class="msg-view">
      <el-empty v-if="pages === null || pages?.data.length === 0" description="没有任何留言"/>
      <div v-else>
        <el-card shadow="hover" v-for="msg in pages.data" style="margin-top: 10px;" >
          <el-row>
            <el-col :span="18">
              <el-text>{{ msg.user.name + "(" + msg.user.id + ")" }}</el-text>
              <el-text type="danger" v-if="msg.top" size="small" style="margin-left: 10px;">置顶</el-text>
            </el-col>
            <el-col :span="6" style="text-align: right;">
              <el-text style="color: #999;" size="small">{{ msg.createDate }}</el-text>
            </el-col>
          </el-row>
          <el-text style="color: #999;" size="small">{{ msg.content }}</el-text>
        </el-card>
      </div>
    </div>

    <!-- 页码组件 -->
    <div class="pagination-div">
      <el-pagination class="pagination" :page-size="pages?.size" layout="total, prev, pager, next, sizes"
                     :current-page="currentPage" :total="pages?.totalData" @current-change="onTableCurrentPageChange"
                     @size-change="onTableSizeChangChange"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
}

.button-group {
  margin-bottom: 10px;
}

.pagination-div {
  margin-top: 9px;
}

.pagination {
  display: flex;
  justify-content: center;
}
</style>