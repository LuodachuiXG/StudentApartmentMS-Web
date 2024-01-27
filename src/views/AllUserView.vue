<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { userByPage } from '../api/userApi';
import { Pager } from '../models/Pager';
import { User } from '../models/User';
import { ElMessage } from 'element-plus';
import { RoleEnum } from '../models/RoleEnum';
import type { TableColumnCtx } from 'element-plus'
import { GenderEnum } from '../models/GenderEnum';

// 存储用户分页数据
const pages = ref<Pager<User> | null>(null);

// 分页器每页条数
const pageSize = ref(10);

// 分页器当前页数
const currentPage = ref(1);

/**
 * Vue 生命周期挂载
 */
onMounted(() => {
  refreshTableData();
});

const refreshTableData = () => {
  // 获取用户
  userByPage(currentPage.value, pageSize.value).then((res) => {
    // 请求成功
    pages.value = res.data;
  }).catch((err) => {
    ElMessage({
      message: err.errMsg,
      duration: 2000,
      type: 'error'
    });
  });
}


/**
 * 格式化表格身份字段，格式化为 '管理员' 或 '学生'
 */
const onTableRoleFormat = (_row: number, _column: number, cellValue: string, _index: number) => {
  if (cellValue === 'ADMIN') {
    return '管理员';
  } else {
    return '学生';
  }
}

/**
 * 格式化表格性别字段，格式化为 '男' 或 '女'
 */
const onTableGenderFormat = (_row: number, _column: number, cellValue: string, _index: number) => {
  if (cellValue === 'MALE') {
    return '男';
  } else {
    return '女';
  }
}

/**
 * 表格当前页数改变事件
 */
const onTableCurrentPageChange = (value: number) => {
  currentPage.value = value;
  // 刷新表格数据
  refreshTableData();
}

/**
 * 表格每页条数改变事件
 */
const onTableSizeChangChange = (value: number) => {
  pageSize.value = value;
  // 刷新表格数据
  refreshTableData();
}

/**
 * 表格用户性别筛选过滤事件
 */
const onTableGenderFilterHandler = (
  value: string,
  row: User
) => {
  return row.gender === value;
}

/**
 * 表格用户身份筛选过滤事件
 */
const onTableRoleFilterHandler = (
  value: string,
  row: User
) => {
  return row.role === value;
}
</script>

<template>
  <div class="container">
    <div class="button-group">
      <el-button-group>
        <el-button>删除</el-button>
        <el-button>编辑</el-button>
        <el-button>编辑</el-button>
      </el-button-group>
    </div>
    <div class="table">
      <!-- 表格，显示用户 -->
      <el-scrollbar>
        <el-table class="table" :data="pages?.data" border height="78vh"
          :default-sort="{ prop: 'birth', order: 'descending' }">
          <el-table-column type="selection" width="55" />
          <el-table-column fixed prop="id" label="学号" width="120" />
          <el-table-column fixed prop="name" label="姓名" width="90" />
          <el-table-column prop="role" label="身份" width="80" :formatter="onTableRoleFormat" :filters="[
            { text: '管理员', value: RoleEnum.ADMIN },
            { text: '学生', value: RoleEnum.STUDENT }
          ]" :filter-method="onTableRoleFilterHandler" />
          <el-table-column prop="phone" label="电话" width="120" />
          <el-table-column prop="gender" label="性别" width="80" :formatter="onTableGenderFormat" :filters="[
            { text: '男', value: GenderEnum.MALE },
            { text: '女', value: GenderEnum.FEMALE }
          ]" :filter-method="onTableGenderFilterHandler" />
          <el-table-column prop="birth" label="出生日期" width="120" sortable />
          <el-table-column prop="lastLogin" label="最后登录" width="220" />
          <el-table-column fixed="right" label="操作" width="180" style="">
            <template #default="scope">
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
              <el-button v-if="scope.row.role === RoleEnum.STUDENT" link type="primary" size="small">宿舍信息</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </div>

    <!-- 页码组件 -->
    <div class="pagination-div">
      <el-pagination class="pagination" :page-size="pages?.size" layout="total, prev, pager, next, sizes"
        :total="pages?.totalData" @current-change="onTableCurrentPageChange" @size-change="onTableSizeChangChange" />
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

.table {
  width: 100%;
}

.pagination-div {
  margin-top: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
}
</style>