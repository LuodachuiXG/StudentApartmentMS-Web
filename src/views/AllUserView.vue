<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { userByPage, deleteUsers, addStudent, userByKeyAndPage, updateUser } from '../api/userApi';
import { Pager } from '../models/Pager';
import { User } from '../models/User';
import { RoleEnum } from '../models/RoleEnum';
import { GenderEnum } from '../models/GenderEnum';
import { errorMsg, formatDate, successMsg, warningConfirmBox } from '../utils/MyUtils';
import { useRoute } from 'vue-router';

/**
 * 学生对话框模式枚举类
 */
enum StudentMode {
  // 编辑模式
  EDIT,
  //
  ADD
}

const route = useRoute();

// 存储用户分页数据
const pages = ref<Pager<User> | null>(null);

// 分页器每页条数
const pageSize = ref(10);

// 分页器当前页数
const currentPage = ref(1);

// 表格选中的用户
const selectedUsers = ref<User[]>();

// 是否显示添加 / 编辑学生对话框
const dialogStudentVisible = ref(false);
// 标记当前学生对话框是添加还是编辑模式
const dialogStudentMode = ref(StudentMode.ADD);
// 添加 / 编辑学生表单
const dialogstudentForm = reactive({
  userId: -1,
  name: '',
  id: '',
  password: '',
  phone: '',
  gender: '男',
  birth: ''
});

// 是否显示聚合查找对话框
const dialogSearchVisible = ref(false);

// 标记当前是否是聚合查找模式
const isSearchMode = ref(false);

// 标记当前聚合查找的关键词
const searchKey = ref('');

// 聚合查找表单
const searchForm = reactive({
  key: ''
});

/**
 * Vue 生命周期挂载
 */
onMounted(() => {
  // 跳转当前页是否带有工号参数
  const id = route.query.id;
  if (id !== undefined) {
    // 带有工号参数，直接进入聚合查找模式
    searchForm.key = id!!.toString();
    // 启动聚合查找
    onDialogSearchClick();
  } else {
    // 没有传参，正常获取所有用户
    refreshTableData();
  }
});

/**
 * 刷新表格用户数据
 */
const refreshTableData = () => {
  // 判断当前是否是聚合查找模式
  if (isSearchMode.value) {
    // 当前是聚合查找模式，刷新根据关键词查找用户的结果
    userByKeyAndPage(searchForm.key, currentPage.value, pageSize.value).then((res) => {
      // 查找成功，显示查找结果
      pages.value = res.data;
    }).catch((err) => {
      // 查找失败
      errorMsg(err);
    });
  } else {
    // 当前是普通显示用户模式
    // 获取用户
    userByPage(currentPage.value, pageSize.value).then((res) => {
      // 请求成功
      pages.value = res.data;
    }).catch((err) => {
      errorMsg(err);
    });
  }
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
  if (cellValue === GenderEnum.MALE) {
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

/**
 * 表格选择项改变事件
 * @param values 选择的用户
 */
const onTableSelectChange = (values: User[]) => {
  selectedUsers.value = values;
}

/**
 * 删除用户
 * @param ids 用户 ID 集合
 * @param names 用户姓名集合
 */
const deleteUser = (ids: Array<number>, names: Array<string>) => {
  warningConfirmBox(`确定要删除 [${names}] ${ids.length} 个用户吗？此操作不可逆！`).then(() => {
    deleteUsers(ids).then(() => {
      // 删除成功
      successMsg(`删除 ${ids.length} 个用户成功`);
      // 刷新用户
      refreshTableData();
    }).catch((err) => {
      // 删除用户失败
      errorMsg(err);
    });
  });
}

/**
 * 表格列编辑学生按钮点击事件
 * @param user 学生实体类
 */
const onTableColEditClick = (user: User) => {
  // 清除学生对话框数据
  clearStudentValue();
  // 设置对话框数据为当前学生信息
  dialogstudentForm.userId = user.userId;
  dialogstudentForm.name = user.name;
  dialogstudentForm.id = user.id;
  dialogstudentForm.phone = user.phone;
  dialogstudentForm.gender = user.gender === GenderEnum.MALE ? '男' : '女';
  dialogstudentForm.birth = user.birth;

  // 设置当前为编辑学生模式
  dialogStudentMode.value = StudentMode.EDIT;
  // 显示对话框
  dialogStudentVisible.value = true;
}

/**
 * 表格列删除按钮点击事件
 * @param userId 工号（学号）
 * @param name 用户姓名
 */
const onTableColDeleteClick = (userId: number, name: string) => {
  deleteUser(Array.of(userId), Array.of(name));
}

/**
 * 工具栏添加学生按钮点击事件
 */
const onToolBarAddStudentClick = () => {
  // 清空学生对话框数据
  clearStudentValue();
  // 设置当前为添加学生模式
  dialogStudentMode.value = StudentMode.ADD;
  // 显示对话框
  dialogStudentVisible.value = true;
}

/**
 * 工具栏删除按钮点击事件
 */
const onToolBarDeleteClick = () => {
  // 将当前选中的用户的用户 ID 和姓名存在两个数组中
  const ids = new Array<number>();
  const names = new Array<string>();
  selectedUsers.value?.forEach((user) => {
    ids.push(user.userId);
    names.push(user.name);
  });

  // 调用删除方法
  deleteUser(ids, names);
}

/**
 * 清空学生对话框中的数据
 */
const clearStudentValue = () => {
  dialogstudentForm.userId = -1;
  dialogstudentForm.name = '';
  dialogstudentForm.id = '';
  dialogstudentForm.password = '';
  dialogstudentForm.phone = '';
  dialogstudentForm.birth = '';
  dialogstudentForm.gender = '男';
}

/**
 * 添加 / 编辑学生对话框添加按钮点击事件
 */
const onDialogStudentClick = () => {
  if (dialogstudentForm.name.length === 0 || dialogstudentForm.id.length === 0 ||
    dialogstudentForm.phone.length === 0 || dialogstudentForm.birth === null ||
    dialogstudentForm.birth.length === 0) {
    errorMsg('请将信息填写完整');
    return;
  }

  if (dialogStudentMode.value == StudentMode.ADD) {
    // 当前是添加学生模式
    addStudent(dialogstudentForm.name, dialogstudentForm.id, dialogstudentForm.phone,
      dialogstudentForm.gender === '男' ? GenderEnum.MALE : GenderEnum.FEMALE,
      formatDate(new Date(dialogstudentForm.birth))).then(() => {
        // 添加成功，清空学生信息
        clearStudentValue();
        successMsg('添加成功');
        // 刷新用户数据
        refreshTableData();
        // 关闭学生对话框
        dialogStudentVisible.value = false
      }).catch((err) => {
        errorMsg(err);
      });
  } else {
    // 当前是修改学生模式
    updateUser(dialogstudentForm.userId, dialogstudentForm.name, dialogstudentForm.id,
      dialogstudentForm.password, dialogstudentForm.phone,
      dialogstudentForm.gender === '男' ? GenderEnum.MALE : GenderEnum.FEMALE,
      formatDate(new Date(dialogstudentForm.birth))).then(() => {
        // 修改成功，清空学生信息
        clearStudentValue();
        successMsg('修改成功');
        // 刷新用户数据
        refreshTableData();
        // 关闭学生对话框
        dialogStudentVisible.value = false
      }).catch((err) => {
        errorMsg(err);
      });
  }
}


/**
 * 聚合查找对话框查找按钮点击事件
 */
const onDialogSearchClick = () => {
  if (searchForm.key.length === 0) {
    errorMsg('请将信息填写完整');
    return;
  }
  // 设置当前聚合查找的关键字
  searchKey.value = searchForm.key;
  // 设置当前是聚合查找模式
  isSearchMode.value = true;
  // 设置当前页为第一页
  currentPage.value = 1;
  // 刷新数据
  refreshTableData();
  // 关闭聚合查找对话框
  dialogSearchVisible.value = false;
}


/**
 * 聚合查找对话框重置搜索按钮点击事件
 */
const onDialogSearchResettingClick = () => {
  // 清除当前聚合查找的关键字
  searchKey.value = '';
  // 设置当前不是聚合搜索模式
  isSearchMode.value = false;
  // 清空表单
  searchForm.key = '';
  // 设置当前页为第一页
  currentPage.value = 1;
  // 刷新数据
  refreshTableData();
  // 关闭聚合查找对话框
  dialogSearchVisible.value = false;
}


</script>

<template>
  <div class="container">
    <div class="button-group">
      <el-button plain type="primary" @click="onToolBarAddStudentClick">添加学生</el-button>
      <el-button-group v-if="isSearchMode" style="margin: 0 12px;">
        <el-button type="success" @click="dialogSearchVisible = true">
          {{ '聚合查找：' + searchKey }}
        </el-button>
        <el-button type="warning" @click="onDialogSearchResettingClick">重置查找</el-button>
      </el-button-group>
      <el-button v-if="!isSearchMode" plain type="primary" @click="dialogSearchVisible = true">聚合查找</el-button>
      <el-button type="danger" plain @click="onToolBarDeleteClick"
        :disabled="selectedUsers == null || selectedUsers.length == 0">删除</el-button>

    </div>
    <div class="table">
      <!-- 表格，显示用户 -->
      <el-table class="table" :data="pages?.data" border height="77vh"
        :default-sort="{ prop: 'birth', order: 'descending' }" @selection-change="onTableSelectChange">
        <el-table-column type="selection" width="55" />
        <el-table-column fixed prop="id" label="工号（学号）" width="120" />
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
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="scope">
            <!-- 管理员只能修改学生信息，不能修改管理员信息 -->
            <div v-if="scope.row.role === RoleEnum.STUDENT">
              <el-button link type="primary" size="small" @click="onTableColEditClick(scope.row)">编辑</el-button>
              <el-button link type="primary" size="small">宿舍</el-button>
              <el-button link type="danger" size="small"
                @click="onTableColDeleteClick(scope.row.userId, scope.row.name)">删除</el-button>
            </div>
            <div v-else>
              <el-button link type="primary" size="small">查看</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 页码组件 -->
    <div class="pagination-div">
      <el-pagination class="pagination" :page-size="pages?.size" layout="total, prev, pager, next, sizes"
        :current-page="currentPage" :total="pages?.totalData" @current-change="onTableCurrentPageChange"
        @size-change="onTableSizeChangChange" />
    </div>


    <!-- 添加 / 编辑学生对话框 -->
    <el-dialog v-model="dialogStudentVisible" draggable
      :title="(dialogStudentMode === StudentMode.ADD ? '添加' : '编辑') + '学生'">
      <el-form class="register-form" :model="dialogstudentForm" label-position="left" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="dialogstudentForm.name" placeholder="学生姓名"></el-input>
        </el-form-item>
        <el-form-item label="学号" required>
          <el-input v-model="dialogstudentForm.id" placeholder="学号"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-if="dialogStudentMode === StudentMode.ADD" placeholder="默认密码为手机后六位 学生上线后会提示修改密码"
            disabled></el-input>
          <el-input v-else placeholder="为空保持不变" v-model="dialogstudentForm.password"></el-input>
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="dialogstudentForm.phone" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="dialogstudentForm.gender">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" required>
          <el-date-picker v-model="dialogstudentForm.birth" placeholder="选择出生日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <!-- 只有添加学生模式才显示重置按钮 -->
          <el-button @click="clearStudentValue" type="warning" plain
            v-if="dialogStudentMode === StudentMode.ADD">重置</el-button>
          <el-button @click="dialogStudentVisible = false">取消</el-button>
          <el-button type="primary" @click="onDialogStudentClick">{{ dialogStudentMode === StudentMode.ADD ? '添加' :
            '保存' }}</el-button>
        </span>
      </template>
    </el-dialog>


    <!-- 聚合查找对话框 -->
    <el-dialog v-model="dialogSearchVisible" title="聚合查找" draggable>
      <el-form class="register-form" :model="searchForm" label-position="left" label-width="75px">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.key" placeholder="工号（学号）、姓名、电话"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onDialogSearchResettingClick" type="warning" plain>重置查找</el-button>
          <el-button @click="dialogSearchVisible = false">取消</el-button>
          <el-button type="primary" @click="onDialogSearchClick">查找</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
}

.search-group {
  height: 40px;
  line-height: 40px;
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