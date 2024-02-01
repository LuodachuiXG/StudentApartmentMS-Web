<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { Dorm } from '../models/Dorm';
import { Pager } from '../models/Pager';
import { addDormAdmins, delDorm, delDormAdmins, dormByPage, updateDorm } from '../api/dormApi';
import { errorMsg, successMsg, warningConfirmBox } from '../utils/MyUtils';
import { GenderEnum } from '../models/GenderEnum';
import { useRouter } from 'vue-router';
import { RouterViews } from '../router/RouterViews';
import { StoreEnum } from '../models/StoreEnum';
import { User } from '../models/User';


const router = useRouter();

// 存储宿舍分页数据
const pages = ref<Pager<Dorm> | null>(null);

// 分页器每页条数
const dormsPageSize = ref(10);

// 分页器当前页数
const dormsCurrentPage = ref(1);

// 编辑宿舍对话框是否显示
const dialogEditDormVisible = ref(false);
// 编辑宿舍对话框表单
const dialogEditDormForm = reactive({
  // 宿舍楼 ID
  dormitoryId: -1,
  // 宿舍楼名
  name: '',
  // 当前登录用户是否是该宿舍楼管理员，该字段用于对比此选项是否更改
  isAdmin: false,
  // 编辑宿舍对话框中是否是管理员切换按钮
  isAdminValue: false,
});


/**
 * Vue 生命周期挂载
 */
onMounted(() => {
  // 刷新宿舍信息
  refreshDorms();
});

/**
 * 刷新宿舍信息
 */
const refreshDorms = () => {
  // 获取宿舍
  dormByPage(dormsCurrentPage.value, dormsPageSize.value).then((res) => {
    // 请求成功
    pages.value = res.data;
  }).catch((err) => {
    errorMsg(err);
  });
}

/**
 * 宿舍楼表格当前页数改变事件
 */
const onDormTableCurrentPageChange = (value: number) => {
  dormsCurrentPage.value = value;
  // 刷新宿舍楼表格数据
  refreshDorms();
}

/**
 * 宿舍楼表格每页条数改变事件
 */
const onDormTableSizeChangChange = (value: number) => {
  dormsPageSize.value = value;
  // 刷新宿舍楼表格数据
  refreshDorms();
}

/**
 * 宿舍表，管理员用户标签点击事件
 * @param id 用户工号
 */
const onDormTableUserTagClick = (id: number) => {
  // 跳转用户页面并附带工号，进行聚合查询
  router.push({
    name: RouterViews.ALL_USER,
    query: {
      id: id
    }
  });
}

/**
 * 清空修改宿舍对话框的表单
 */
const clearDialogEditDormForm = () => {
  dialogEditDormForm.dormitoryId = -1;
  dialogEditDormForm.isAdmin = false;
  dialogEditDormForm.name = '';
  dialogEditDormForm.isAdminValue = false;
}

/**
 * 宿舍表格“编辑”按钮点击事件
 * @param dorm 宿舍楼实体类
 */
const onDormTableEditClick = (dorm: Dorm) => {
  clearDialogEditDormForm();
  // 将当前选择编辑的宿舍楼信息写入宿舍楼编辑对话框表单
  dialogEditDormForm.dormitoryId = dorm.dormitoryId;
  dialogEditDormForm.name = dorm.name;
  const currentLoginUser = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
  // 检查当前登录用户是否是该宿舍的管理员
  dorm.admins.forEach((user) => {
    if (user.userId === currentLoginUser.userId) {
      dialogEditDormForm.isAdmin = true;
      dialogEditDormForm.isAdminValue = true;
      return;
    }
  });
  // 显示宿舍楼编辑对话框
  dialogEditDormVisible.value = true;
}

/**
 * 宿舍楼编辑对话框保存按钮点击事件
 */
const onDialogEditDormSaveClick = () => {
  if (dialogEditDormForm.name.length === 0) {
    errorMsg('请将内容填写完整');
    return;
  }

  // 修改宿舍
  updateDorm(dialogEditDormForm.dormitoryId, dialogEditDormForm.name).then(() => {
    // 修改宿舍成功
    // 判断是否需要修改宿舍管理员
    if (dialogEditDormForm.isAdmin !== dialogEditDormForm.isAdminValue) {
      // 编辑宿舍对话框中“管理该宿舍”按钮值被修改
      const currentLoginUser = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
      if (dialogEditDormForm.isAdminValue) {
        // 添加宿舍管理员
        addDormAdmins(dialogEditDormForm.dormitoryId, [currentLoginUser]).then(() => {
          // 添加宿舍管理员成功
          successMsg('修改成功');
          dialogEditDormVisible.value = false;
          refreshDorms();
        }).catch((err) => {
          // 添加宿舍管理员失败
          errorMsg(err);
        });
      } else {
        // 删除宿舍管理员
        delDormAdmins(dialogEditDormForm.dormitoryId, [currentLoginUser]).then(() => {
          // 添加宿舍管理员成功
          successMsg('修改成功');
          dialogEditDormVisible.value = false;
          refreshDorms();
        }).catch((err) => {
          // 删除宿舍管理员失败
          errorMsg(err);
        });
      }
    } else {
      // 编辑宿舍对话框中“管理该宿舍”按钮值没有被修改
      successMsg('修改成功');
      dialogEditDormVisible.value = false;
      refreshDorms();
    }
  }).catch((err) => {
    // 修改宿舍失败
    errorMsg(err);
  });
}

/**
 * 宿舍楼表删除按钮点击事件
 * @param dorm 
 */
const onDormTableDelClick = (dorm: Dorm) => {
  warningConfirmBox('确定要删除 [' + dorm.name + '] 宿舍楼吗，此操作不可逆！').then(() => {
    delDorm(dorm.dormitoryId).then(() => {
      // 删除成功
      successMsg('删除成功');
      refreshDorms();
    }).catch((err) => {
      errorMsg(err);
    });
  });
}

/**
 * 工具栏“添加宿舍楼”按钮点击事件
 */
const onToolBarAddDormClick = () => {

}
</script>

<template>
  <div class="container">
    <el-tabs stretch>
      <el-tab-pane label="宿舍楼">
        <div class="button-group">
          <el-button plain type="primary" @click="onToolBarAddDormClick">添加宿舍楼</el-button>
        </div>
        <div class="table">
          <!-- 表格，显示宿舍楼 -->
          <el-table class="table" :data="pages?.data" border height="70vh"
            :default-sort="{ prop: 'birth', order: 'descending' }">
            <el-table-column fixed prop="name" label="宿舍楼名" width="120" />
            <el-table-column fixed prop="totalBeds" label="总床位" width="120" />
            <el-table-column fixed prop="headCount" label="入住人数" width="90" />
            <el-table-column fixed="right" label="宿舍管理员">
              <template #default="scope">
                <div>
                  <el-popover :width="300" :title="user.name" v-for="user in scope.row.admins" :key="user.userId">
                    <template #reference>
                      <el-tag round @click="onDormTableUserTagClick(user.id)" style="margin-right: 5px; cursor: pointer;"
                        type="warning">
                        {{ user.name }}
                      </el-tag>
                    </template>
                    <template #default>
                      <div class="demo-rich-conent" style="display: flex; gap: 10px; flex-direction: column">
                        <p>性别：{{ user.gender === GenderEnum.MALE ? '男' : '女' }}</p>
                        <p>工号：{{ user.id }}</p>
                        <p>电话：{{ user.phone }}</p>
                      </div>
                    </template>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180">
              <template #default=scope>
                <el-button link type="primary" size="small" @click="onDormTableEditClick(scope.row)">编辑</el-button>
                <el-button link type="primary" size="small">查看房间</el-button>
                <el-button link type="danger" size="small" @click="onDormTableDelClick(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 页码组件 -->
        <div class="pagination-div">
          <el-pagination class="pagination" :page-size="pages?.size" layout="total, prev, pager, next, sizes"
            :current-page="dormsCurrentPage" :total="pages?.totalData" @current-change="onDormTableCurrentPageChange"
            @size-change="onDormTableSizeChangChange" />
        </div>


        <!-- 修改宿舍对话框 -->
        <el-dialog v-model="dialogEditDormVisible" title="编辑宿舍" draggable>
          <el-form class="register-form" :model="dialogEditDormForm" label-position="left" label-width="85px">
            <el-form-item label="宿舍楼名">
              <el-input v-model="dialogEditDormForm.name" placeholder="宿舍楼名称"></el-input>
            </el-form-item>
            <el-form-item label="管理该宿舍">
              <el-switch v-model="dialogEditDormForm.isAdminValue" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogEditDormVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogEditDormSaveClick">保存</el-button>
            </span>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="宿舍房间">
        宿舍房间
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
}

.pagination-div {
  margin-top: 9px;
}

.pagination {
  display: flex;
  justify-content: center;
}

.button-group {
  margin-bottom: 10px;
}
</style>