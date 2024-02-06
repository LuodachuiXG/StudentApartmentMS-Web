<script setup lang="ts">
// 存储留言分页数据
import {onMounted, reactive, ref} from "vue";
import {Pager} from "../models/Pager.ts";
import {MessageBoard} from "../models/MessageBoard.ts";
import {User} from "../models/User.ts";
import {StoreEnum} from "../models/StoreEnum.ts";
import {RoleEnum} from "../models/RoleEnum.ts";
import {Dorm} from "../models/Dorm.ts";
import {getDormsByAdmin, getStudentRoomInfoByUserId} from "../api/dormApi.ts";
import {errorMsg, infoConfirmBox, successMsg} from "../utils/MyUtils.ts";
import {addMsg, delMsg, getMsgByPage} from "../api/msgApi.ts";
import {StudentRoomInfo} from "../models/StudentRoomInfo.ts";

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

// 添加留言对话框是否显示
const dialogAddMsgVisible = ref(false);
// 添加留言对话框表单
const dialogAddMsgForm = reactive({
  dormId: null as number | null,
  content: '',
  top: false
});

// 当前登录的学生入住信息
const studentRoomInfo = ref<StudentRoomInfo | null>(null);

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
  } else {
    // 获取学生入住宿舍信息
    getStudentRoomInfoByUserId(user.value?.userId!!).then((res) => {
      if (res.data !== null) {
        // 学生已经分配了宿舍
        let sri = res.data as StudentRoomInfo;
        studentRoomInfo.value = sri;
        // 获取学生入住的宿舍的留言
        currentSelectDormId.value = sri.dormId;
        refreshDormMsg();
      } else {
        // 学生还没有分配宿舍
        studentRoomInfo.value = null;
      }
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

/**
 * 留言板删除按钮点击事件
 * @param msg 留言实体类
 */
const onMsgDelClick = (msg: MessageBoard) => {
  infoConfirmBox(`确定要删除${msg.user.name}的留言吗`).then(() => {
    // 删除留言
    delMsg(msg.messageBoardId).then(() => {
      successMsg('删除成功');
      // 刷新留言
      refreshDormMsg();
    }).catch((err) => {
      errorMsg(err);
    });
  });
}

// 清空添加留言表单
const clearDialogAddMsgForm = () => {
  dialogAddMsgForm.dormId = null;
  dialogAddMsgForm.content = '';
  dialogAddMsgForm.top = false;
}

// 添加留言按钮点击事件
const onAddMsgClick = () => {
  // 清空之前的表单内容
  clearDialogAddMsgForm();

  // 打开添加留言对话框
  dialogAddMsgVisible.value = true;
}

// 添加留言对话框添加按钮点击事件
const onDialogAddMsgClick = () => {
  if (user.value?.role === RoleEnum.ADMIN) {
    // 当前是管理员用户
    if (dialogAddMsgForm.dormId === null || dialogAddMsgForm.content.length === 0) {
      errorMsg('请将内容填写完整');
      return;
    }

    // 添加留言
    addMsg(dialogAddMsgForm.dormId, dialogAddMsgForm.content, dialogAddMsgForm.top).then(() => {
      // 添加成功
      successMsg('添加成功');
      // 刷新留言
      if (currentSelectDormId.value !== undefined) {
        // 只有在已经选择了当前宿舍的情况下才刷新留言
        refreshDormMsg();
      }
      // 关闭对话框
      dialogAddMsgVisible.value = false;
      // 清空对话框内容
      clearDialogAddMsgForm();
    }).catch((err) => {
      errorMsg(err);
    });
  } else {
    // 当前是学生用户
    if (dialogAddMsgForm.content.length === 0) {
      errorMsg('请将内容填写完整');
      return;
    }

    // 添加留言
    addMsg(studentRoomInfo.value?.dormId!!, dialogAddMsgForm.content, false).then(() => {
      // 添加成功
      successMsg('添加成功');
      // 刷新留言
      refreshDormMsg();
      // 关闭对话框
      dialogAddMsgVisible.value = false;
      // 清空对话框内容
      clearDialogAddMsgForm();
    }).catch((err) => {
      errorMsg(err);
    });
  }
}

</script>

<template>
  <div class="container">
    <div class="button-group">
      <!-- 管理员选择自己管理的宿舍 -->
      <el-select
          v-if="user?.role===RoleEnum.ADMIN"
          v-model="currentSelectDormId"
          placeholder="选择你管理的宿舍"
          style="width: 240px;margin-right: 10px;"
          no-data-text="你没有管理任何宿舍"
          @change="onSelectAdminDormChange">
        <el-option
            v-for="dorm in dorms"
            :key="dorm.dormitoryId"
            :label="dorm.name"
            :value="dorm.dormitoryId"
        />
      </el-select>
      <el-button v-if="user?.role === RoleEnum.ADMIN || (user?.role === RoleEnum.STUDENT && studentRoomInfo !== null)"
                 plain type="primary"
                 @click="onAddMsgClick">添加留言
      </el-button>
    </div>

    <!-- 展示所有留言 -->
    <div class="msg-view">
      <el-empty v-if="pages === null || pages?.data.length === 0"
                :description="user?.role===RoleEnum.ADMIN ? '没有任何留言' :
                (studentRoomInfo === null ? '你还没有分配宿舍，无法查看留言' : '没有任何留言')"/>
      <div v-else>
        <el-card shadow="hover" v-for="msg in pages.data" style="margin-top: 10px;">
          <el-row>
            <el-col :span="18">
              <el-text>{{ msg.user.name + "(" + msg.user.id + ")" }}</el-text>
              <el-tag v-if="msg.user.role === RoleEnum.ADMIN" round effect="plain" size="small" class="msg-tip-tag">
                管理员
              </el-tag>
              <el-tag v-if="msg.top" round effect="dark" size="small" class="msg-tip-tag" type="danger">置顶</el-tag>
            </el-col>
            <el-col :span="6" style="text-align: right;">
              <el-text style="color: #999;" size="small">{{ msg.createDate }}</el-text>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="18">
              <el-text style="color: #999;" size="small">{{ msg.content }}</el-text>
            </el-col>
            <el-col :span="6" style="text-align: right;">
              <!-- 删除按钮只有在管理员，或者是学生但是是当前学生自己的留言时才显示 -->
              <el-text size="small" type="primary" style="cursor: pointer;" @click="onMsgDelClick(msg)"
                       v-if="user?.role === RoleEnum.ADMIN || (user?.role === RoleEnum.STUDENT && msg.userId === user.userId)">
                删除
              </el-text>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </div>

    <!-- 页码组件 -->
    <div class="pagination-div">
      <el-pagination class="pagination" :page-size="pages?.size" layout="total, prev, pager, next, sizes"
                     :current-page="currentPage" :total="pages?.totalData" @current-change="onTableCurrentPageChange"
                     @size-change="onTableSizeChangChange"/>
    </div>

    <!-- 添加留言对话框 -->
    <el-dialog v-model="dialogAddMsgVisible" title="添加留言" draggable>
      <el-form class="register-form" :model="dialogAddMsgForm" label-position="left" label-width="85px">
        <el-form-item label="宿舍楼" v-if="user?.role === RoleEnum.ADMIN">
          <el-select
              v-model="dialogAddMsgForm.dormId"
              placeholder="选择你管理的宿舍"
              style="width: 240px"
              no-data-text="你没有管理任何宿舍">
            <el-option
                v-for="dorm in dorms"
                :key="dorm.dormitoryId"
                :label="dorm.name"
                :value="dorm.dormitoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="留言内容">
          <el-input v-model="dialogAddMsgForm.content" placeholder="留言内容" type="textarea" maxlength="200"
                    show-word-limit/>
        </el-form-item>
        <el-form-item label="置顶留言" v-if="user?.role === RoleEnum.ADMIN">
          <el-switch v-model="dialogAddMsgForm.top"/>
        </el-form-item>
      </el-form>
      <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogAddMsgVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogAddMsgClick">添加</el-button>
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

.msg-tip-tag {
  vertical-align: top;
  margin-left: 5px;
}
</style>