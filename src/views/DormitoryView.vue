<script setup lang="ts">
import {onMounted, ref, reactive} from 'vue';
import {Dorm} from '../models/Dorm';
import {Pager} from '../models/Pager';
import {
  addDorm,
  addDormAdmins,
  allDorms,
  delDorm,
  delDormAdmins,
  dormsByPage,
  updateDorm,
  roomsByPage, addRooms, delRooms, updateRoom, updateRoomUsers
} from '../api/dormApi';
import {errorMsg, successMsg, warningConfirmBox} from '../utils/MyUtils';
import {GenderEnum} from '../models/GenderEnum';
import {useRouter} from 'vue-router';
import {RouterViews} from '../router/RouterViews';
import {StoreEnum} from '../models/StoreEnum';
import {User} from '../models/User';
import {Room} from '../models/Room';
import {studentByKey} from "../api/userApi.ts";


const router = useRouter();

// 选项卡当前选择项
const tabPaneCurrent = ref('0');

// “宿舍楼”选项卡中存储宿舍分页数据
const tabDormPages = ref<Pager<Dorm> | null>(null);

// “宿舍楼”选项卡中分页器每页条数
const tabDormsPageSize = ref(10);

// “宿舍楼”选项卡中分页器当前页数
const tabDormsCurrentPage = ref(1);

// 编辑宿舍对话框是否显示
const tabDormDialogEditDormVisible = ref(false);
// 编辑宿舍对话框表单
const tabDormDialogEditDormForm = reactive({
  // 宿舍楼 ID
  dormitoryId: -1,
  // 宿舍楼名
  name: '',
  // 当前登录用户是否是该宿舍楼管理员，该字段用于对比此选项是否更改
  isAdmin: false,
  // 编辑宿舍对话框中是否是管理员切换按钮
  isAdminValue: false,
});


// 添加宿舍对话框是否显示
const tabDormDialogAddDormVisible = ref(false);
// 添加宿舍对话框表单
const tabDormDialogAddDormForm = reactive({
  // 宿舍楼名
  name: ''
});


// “宿舍房间”选项卡中当前选择的宿舍楼
const tabRoomCurrentSelectDorm = ref<number | null>();

// “宿舍房间”选项卡中表格选中的房间
const tabRoomSelectedRooms = ref<Room[]>();

// “宿舍房间”选项卡中存储所有宿舍楼（用于工具栏的宿舍选择器）
const tabRoomDorms = ref<Array<Dorm>>();

// “宿舍房间”选项卡中分页存储当前宿舍所有房间
const tabRoomPages = ref<Pager<Room> | null>(null);

// “宿舍房间”选项卡中分页器每页条数
const tabRoomsPageSize = ref(10);

// “宿舍房间”选项卡中分页器当前页数
const tabRoomsCurrentPage = ref(1);

// 添加房间对话框是否显示
const tabRoomDialogAddRoomVisible = ref(false);
// 添加房间对话框表单
const tabRoomDialogAddRoomForm = reactive({
  // 宿舍楼 ID
  dormId: '',
  // 房间名
  roomName: '',
  // 总床位
  totalBeds: 0,
});


// 修改房间对话框是否显示
const tabRoomDialogEditRoomVisible = ref(false);
// 修改房间对话框表单
const tabRoomDialogEditRoomForm = reactive({
  // 宿舍楼 ID
  dormId: -1,
  // 宿舍房间 ID
  roomId: -1,
  // 房间名
  roomName: '',
  // 总床位
  totalBeds: 0,
});

// 宿舍房间添加学生，学生选择器接口
interface StudentItem {
  value: User,
  label: string
}

// 添加学生对话框是否显示
const tabRoomDialogAddStudentVisible = ref(false);
// 添加学生对话框表单
const tabRoomDialogAddStudentForm = reactive({
  // 房间 ID
  roomId: -1,
  // 房间名
  roomName: '',
  // 房间总床位
  totalBeds: 0,
  // 学生选择器是否在加载中
  loading: false,
  // 从远程获取的学生
  students: Array<StudentItem>(),
  // 学生选择器，用户输入的数据
  value: [],
});


/**
 * Vue 生命周期挂载
 */
onMounted(() => {
  // 刷新宿舍信息
  tabDormRefreshDorms();
});

/**
 * “宿舍楼”选项卡中刷新宿舍信息
 */
const tabDormRefreshDorms = () => {
  // 获取宿舍
  dormsByPage(tabDormsCurrentPage.value, tabDormsPageSize.value).then((res) => {
    // 请求成功
    tabDormPages.value = res.data;
  }).catch((err) => {
    errorMsg(err);
  });
}


// “宿舍房间”选项卡中获取所有宿舍
const tabRoomRefreshAllDorms = () => {
  allDorms().then((res) => {
    // 获取宿舍成功
    tabRoomDorms.value = res.data;
  }).catch((err) => {
    // 获取宿舍失败
    errorMsg(err);
  });
}

// “宿舍房间”选项卡中根据宿舍楼 ID 获取房间
const tabRoomRefreshRooms = () => {
  // 获取宿舍房间
  roomsByPage(tabRoomCurrentSelectDorm.value!!, tabRoomsCurrentPage.value, tabRoomsPageSize.value).then((res) => {
    // 请求成功
    tabRoomPages.value = res.data;
  }).catch((err) => {
    errorMsg(err);
  });
}

/**
 * 选项卡切换事件
 * @param name 选项卡名
 */
const onTabChange = (name: string) => {
  switch (name) {
    case '0':
      // “宿舍楼”选项卡
      // 刷新所有宿舍
      tabDormRefreshDorms();
      break;
    case '1':
      // “宿舍房间”选项卡
      // 刷新宿舍选择器的数据
      tabRoomRefreshAllDorms();
      if (tabRoomCurrentSelectDorm.value !== undefined &&
          tabRoomCurrentSelectDorm.value !== null) {
        // 如果宿舍选择器的数据不为空，就刷新当前宿舍的房间
        tabRoomRefreshRooms();
      }
      break;
  }
}

/**
 * “宿舍楼”选项卡宿舍楼表格当前页数改变事件
 */
const onDormTableCurrentPageChange = (value: number) => {
  tabDormsCurrentPage.value = value;
  // 刷新宿舍楼表格数据
  tabDormRefreshDorms();
}

/**
 * “宿舍楼”选项卡宿舍楼表格每页条数改变事件
 */
const onDormTableSizeChangChange = (value: number) => {
  tabDormsPageSize.value = value;
  // 刷新宿舍楼表格数据
  tabDormRefreshDorms();
}

/**
 * “宿舍房间”选项卡宿舍楼表格当前页数改变事件
 */
const onRoomTableCurrentPageChange = (value: number) => {
  tabRoomsCurrentPage.value = value;
  // 刷新宿舍房间表格数据
  tabRoomRefreshRooms();
}

/**
 * “宿舍房间”选项卡宿舍楼表格每页条数改变事件
 */
const onRoomTableSizeChangChange = (value: number) => {
  tabRoomsPageSize.value = value;
  // 刷新宿舍房间表格数据
  tabRoomRefreshRooms();
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
  tabDormDialogEditDormForm.dormitoryId = -1;
  tabDormDialogEditDormForm.isAdmin = false;
  tabDormDialogEditDormForm.name = '';
  tabDormDialogEditDormForm.isAdminValue = false;
}

/**
 * 清空添加宿舍对话框的表单
 */
const clearDialogAddDormForm = () => {
  tabDormDialogAddDormForm.name = '';
}

/**
 * 宿舍表格“编辑”按钮点击事件
 * @param dorm 宿舍楼实体类
 */
const onDormTableEditClick = (dorm: Dorm) => {
  clearDialogEditDormForm();
  // 将当前选择编辑的宿舍楼信息写入宿舍楼编辑对话框表单
  tabDormDialogEditDormForm.dormitoryId = dorm.dormitoryId;
  tabDormDialogEditDormForm.name = dorm.name;
  const currentLoginUser = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
  // 检查当前登录用户是否是该宿舍的管理员
  dorm.admins.forEach((user) => {
    if (user.userId === currentLoginUser.userId) {
      tabDormDialogEditDormForm.isAdmin = true;
      tabDormDialogEditDormForm.isAdminValue = true;
      return;
    }
  });
  // 显示宿舍楼编辑对话框
  tabDormDialogEditDormVisible.value = true;
}

/**
 * 宿舍表格“查看房间”按钮点击事件
 * @param dorm 宿舍楼实体类
 */
const onDormTableViewRoomClick = (dorm: Dorm) => {
  // 先刷新“宿舍房间”选项卡工具栏宿舍选择器的数据
  tabRoomRefreshAllDorms();
  // 将 Tab Pane 切换到“宿舍房间”选项卡
  tabPaneCurrent.value = '1';
  // 将当前点击宿舍 ID 设为“宿舍房间”选项卡工具栏宿舍选择器的当前选项
  tabRoomCurrentSelectDorm.value = dorm.dormitoryId;
  // 刷新“宿舍房间”选项卡选择的宿舍的房间
  tabRoomRefreshRooms();
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
      tabDormRefreshDorms();

      // 如果“宿舍房间”选项卡宿舍选择器选择的是当前被删除的宿舍，清空选择的数据
      if (tabRoomCurrentSelectDorm.value === dorm.dormitoryId) {
        tabRoomCurrentSelectDorm.value = null;
      }
    }).catch((err) => {
      errorMsg(err);
    });
  });
}


/**
 * 编辑宿舍楼对话框保存按钮点击事件
 */
const onDialogEditDormSaveClick = () => {
  if (tabDormDialogEditDormForm.name.length === 0) {
    errorMsg('请将内容填写完整');
    return;
  }

  // 修改宿舍
  updateDorm(tabDormDialogEditDormForm.dormitoryId, tabDormDialogEditDormForm.name).then(() => {
    // 修改宿舍成功
    // 判断是否需要修改宿舍管理员
    if (tabDormDialogEditDormForm.isAdmin !== tabDormDialogEditDormForm.isAdminValue) {
      // 编辑宿舍对话框中“管理该宿舍”按钮值被修改
      const currentLoginUser = JSON.parse(localStorage.getItem(StoreEnum.USER)!!) as User;
      if (tabDormDialogEditDormForm.isAdminValue) {
        // 添加宿舍管理员
        addDormAdmins(tabDormDialogEditDormForm.dormitoryId, [currentLoginUser]).then(() => {
          // 添加宿舍管理员成功
          successMsg('修改成功');
          tabDormDialogEditDormVisible.value = false;
          tabDormRefreshDorms();
        }).catch((err) => {
          // 添加宿舍管理员失败
          errorMsg(err);
        });
      } else {
        // 删除宿舍管理员
        delDormAdmins(tabDormDialogEditDormForm.dormitoryId, [currentLoginUser]).then(() => {
          // 添加宿舍管理员成功
          successMsg('修改成功');
          tabDormDialogEditDormVisible.value = false;
          tabDormRefreshDorms();
        }).catch((err) => {
          // 删除宿舍管理员失败
          errorMsg(err);
        });
      }
    } else {
      // 编辑宿舍对话框中“管理该宿舍”按钮值没有被修改
      successMsg('修改成功');
      tabDormDialogEditDormVisible.value = false;
      tabDormRefreshDorms();
    }
  }).catch((err) => {
    // 修改宿舍失败
    errorMsg(err);
  });
}

/**
 * 添加宿舍楼对话框添加按钮点击事件
 */
const onDialogAddDormSaveClick = () => {
  // 添加宿舍楼
  addDorm(tabDormDialogAddDormForm.name).then(() => {
    // 添加成功
    successMsg('添加成功');
    // 刷新宿舍楼
    tabDormRefreshDorms();
    // 清空添加宿舍楼对话框表单
    clearDialogAddDormForm();
    // 关闭添加宿舍楼对话框
    tabDormDialogAddDormVisible.value = false;
  }).catch((err) => {
    errorMsg(err);
  });
}


/**
 * “宿舍楼”选项卡，工具栏“添加宿舍楼”按钮点击事件
 */
const onTabDormToolBarAddDormClick = () => {
  tabDormDialogAddDormVisible.value = true;
}


/**
 * “宿舍房间”选项卡，宿舍选择框选项改变事件
 */
const onTabRoomDormSelectChange = () => {
  tabRoomRefreshRooms();
}

/**
 * “宿舍房间”选项卡，工具栏“添加房间”按钮点击事件
 */
const onTabRoomToolBarAddRoomClick = () => {
  tabRoomDialogAddRoomVisible.value = true;
}

/**
 * “宿舍房间”选项卡，房间表格编辑按钮点击事件
 * @param room 房间实体类
 */
const onTabRoomTableEditClick = (room: Room) => {
  // 将当前房间数据写到编辑房间对话框表单中
  tabRoomDialogEditRoomForm.dormId = room.dormitoryId;
  tabRoomDialogEditRoomForm.roomId = room.roomId;
  tabRoomDialogEditRoomForm.roomName = room.name;
  tabRoomDialogEditRoomForm.totalBeds = room.totalBeds;
  // 显示编辑房间对话框
  tabRoomDialogEditRoomVisible.value = true;
}

/**
 * “宿舍房间”选项卡，房间表格添加学生按钮点击事件
 * @param room 房间实体类
 */
const onTabRoomTableAddStudentClick = (room: Room) => {
  // 将当前房间数据写到添加学生对话框表单中
  tabRoomDialogAddStudentForm.roomId = room.roomId;
  tabRoomDialogAddStudentForm.roomName = room.name;
  tabRoomDialogAddStudentForm.totalBeds = room.totalBeds;

  let studentItems = Array<StudentItem>();
  let studentIds = Array<number>();
  room.users?.forEach((user) => {
    studentItems.push({value: user, label: user.id + ' - ' + user.name});
    studentIds.push(user.userId);
  });
  tabRoomDialogAddStudentForm.students = studentItems;
  tabRoomDialogAddStudentForm.value = studentIds;

  // 显示编辑房间对话框
  tabRoomDialogAddStudentVisible.value = true;
}

/**
 * “宿舍房间”选项卡，房间表格删除按钮点击事件
 * @param room 房间实体类
 */
const onTabRoomTableDelClick = (room: Room) => {
  warningConfirmBox(`确定要删除 [${room.name}] 房间吗，此操作不可逆`).then(() => {
    // 删除房间
    onDelRoomsByRoomIds([room.roomId]);
  });
}

/**
 * 使用房间 ID 数组删除房间
 * @param roomsIds 房间 ID 数组
 */
const onDelRoomsByRoomIds = (roomsIds: Array<number>) => {
  delRooms(roomsIds).then(() => {
    // 删除成功
    successMsg('删除成功');
    // 刷新当前宿舍楼的房间
    tabRoomRefreshRooms();
  }).catch((err) => {
    // 删除失败
    errorMsg(err);
  })
}

/**
 * 添加房间对话框“添加”按钮点击事件
 */
const onDialogAddRoomSaveClick = () => {
  if (tabRoomDialogAddRoomForm.dormId.length === 0 ||
      tabRoomDialogAddRoomForm.roomName.length === 0 ||
      tabRoomDialogAddRoomForm.totalBeds <= 0) {
    errorMsg('请将信息填写完整');
    return;
  }

  let rooms: Array<Room>;
  if (tabRoomDialogAddRoomForm.roomName.indexOf(',') === -1) {
    // 只有一个房间名
    rooms = [{
      dormitoryId: Number(tabRoomDialogAddRoomForm.dormId),
      name: tabRoomDialogAddRoomForm.roomName,
      totalBeds: tabRoomDialogAddRoomForm.totalBeds,
      // 下面三个参数占位用，服务器不处理
      roomId: -1,
      headCount: -1,
      users: null
    }];
  } else {
    // 有多个宿舍名
    let splitRoomNames = tabRoomDialogAddRoomForm.roomName.split(',');
    rooms = new Array<Room>();
    // 将每个宿舍加入 rooms
    splitRoomNames.forEach((roomName) => {
      if (roomName.length !== 0) {
        rooms.push({
          dormitoryId: Number(tabRoomDialogAddRoomForm.dormId),
          name: roomName,
          totalBeds: tabRoomDialogAddRoomForm.totalBeds,
          // 下面三个参数占位用，服务器不处理
          roomId: -1,
          headCount: -1,
          users: null
        })
      }
    });
  }

  // 添加房间
  addRooms(rooms).then(() => {
    // 添加成功
    successMsg('添加成功')
    // 清空添加房间对话框表单
    clearDialogAddRoomForm();
    // 关闭添加房间对话框
    tabRoomDialogAddRoomVisible.value = false;

    // 如果当前选择的宿舍楼不为空，就刷新当前选择的宿舍楼的房间
    if (tabRoomCurrentSelectDorm.value != null) {
      tabRoomRefreshRooms();
    }
  }).catch((err) => {
    errorMsg(err);
  });
}

/**
 * 清空添加房间对话框表单
 */
const clearDialogAddRoomForm = () => {
  tabRoomDialogAddRoomForm.dormId = '';
  tabRoomDialogAddRoomForm.roomName = '';
}

/**
 * “宿舍楼”选项卡中表格选择项改变事件
 * @param values 选择的房间
 */
const onTabRoomTableSelectChange = (values: Room[]) => {
  tabRoomSelectedRooms.value = values;
}

/**
 * “宿舍楼”选项卡中工具栏删除按钮点击事件
 */
const onTabRoomToolBarDeleteClick = () => {
  // 获取表格选中的房间的 ID
  let roomIds = new Array<number>();
  // 获取表格选中的房间名
  let roomNames = new Array<string>();
  tabRoomSelectedRooms.value?.forEach((room) => {
    roomIds.push(room.roomId);
    roomNames.push(room.name);
  });
  warningConfirmBox(`确定要删除 [${roomNames}] ${roomIds.length} 个房间吗，此操作不可逆！`).then(() => {
    // 删除房间
    onDelRoomsByRoomIds(roomIds);
  });
}


/**
 * 清空编辑房间对话框表单
 */
const clearDialogEditRoomForm = () => {
  tabRoomDialogEditRoomForm.dormId = -1;
  tabRoomDialogEditRoomForm.roomId = -1;
  tabRoomDialogEditRoomForm.roomName = '';
  tabRoomDialogEditRoomForm.totalBeds = 0;
}

/**
 * 编辑宿舍房间对话框保存按钮点击事件
 */
const onDialogEditRoomSaveClick = () => {
  if (tabRoomDialogEditRoomForm.roomName.length === 0 ||
      tabRoomDialogEditRoomForm.totalBeds <= 0) {
    errorMsg('请将信息填写完整');
    return;
  }

  // 修改房间
  updateRoom(tabRoomDialogEditRoomForm.dormId,
      tabRoomDialogEditRoomForm.roomId,
      tabRoomDialogEditRoomForm.roomName,
      tabRoomDialogEditRoomForm.totalBeds).then(() => {
    // 修改成功
    successMsg('修改成功');
    // 关闭编辑房间对话框
    tabRoomDialogEditRoomVisible.value = false;
    // 刷新房间数据
    tabRoomRefreshRooms();
    // 清空编辑对话框表单内容
    clearDialogEditRoomForm();
  }).catch((err) => {
    // 修改失败
    errorMsg(err);
  });
}


/**
 * “宿舍房间”选项卡，添加学生对话框，学生选择器从服务器获取学生事件
 * @param key 学生选择器中输入的关键词
 */
const tabRoomDialogAddStudentGetStudents = (key: string) => {
  // 如果关键词不为空，就去服务器检索
  if (key) {
    // 首先清空之前获取的所有符合关键词的学生列表
    tabRoomDialogAddStudentForm.students.length = 0;
    // 标记正在加载
    tabRoomDialogAddStudentForm.loading = true;
    // 根据关键词获取学生
    studentByKey(key).then((res) => {
      let students = res.data as Array<User>;
      students.forEach((stu) => {
        tabRoomDialogAddStudentForm.students
            .push({value: stu, label: stu.id + ' - ' + stu.name} as StudentItem)
      });
      tabRoomDialogAddStudentForm.loading = false;
    }).catch((err) => {
      errorMsg(err);
      tabRoomDialogAddStudentForm.students.length = 0;
      tabRoomDialogAddStudentForm.loading = false;
    });
  }
}

/**
 * “宿舍房间”选项卡，清除宿舍房间添加学生表单
 */
const clearDialogAddStudentForm = () => {
  tabRoomDialogAddStudentForm.roomId = -1;
  tabRoomDialogAddStudentForm.roomName = '';
  tabRoomDialogAddStudentForm.totalBeds = 0;
  tabRoomDialogAddStudentForm.loading = false;
  tabRoomDialogAddStudentForm.students = [];
  tabRoomDialogAddStudentForm.value = [];
}

/**
 * “宿舍房间”选项卡，宿舍房间添加学生对话框保存按钮点击事件
 */
const onDialogAddStudentSaveClick = () => {
  // 修改宿舍住户
  updateRoomUsers(tabRoomDialogAddStudentForm.roomId, tabRoomDialogAddStudentForm.value).then(() => {
    successMsg('保存成功');
    // 关闭添加学生对话框
    tabRoomDialogAddStudentVisible.value = false;
    // 清除表单内容
    clearDialogAddStudentForm();
    // 刷新当前宿舍楼所有房间信息
    tabRoomRefreshRooms();
  }).catch((err) => {
    errorMsg(err);
  })
}
</script>

<template>
  <div class="container">
    <el-tabs stretch @tab-change="onTabChange" v-model="tabPaneCurrent">
      <el-tab-pane label="宿舍楼">
        <div class="button-group">
          <el-button plain type="primary" @click="onTabDormToolBarAddDormClick">添加宿舍楼</el-button>
        </div>
        <div class="table">
          <!-- 表格，显示宿舍楼 -->
          <el-table class="table" :data="tabDormPages?.data" border height="70vh"
                    :default-sort="{ prop: 'birth', order: 'descending' }">
            <el-table-column fixed prop="name" label="宿舍楼名" width="130" sortable/>
            <el-table-column fixed prop="totalBeds" label="总床位" width="130" sortable/>
            <el-table-column fixed prop="headCount" label="入住人数" width="130" sortable/>
            <el-table-column fixed="right" label="宿舍管理员">
              <template #default="scope">
                <div>
                  <el-popover :width="300" :title="user.name" v-for="user in scope.row.admins" :key="user.userId">
                    <template #reference>
                      <el-tag round @click="onDormTableUserTagClick(user.id)"
                              style="margin-right: 5px; cursor: pointer;"
                              type="warning">
                        {{ user.name }}
                      </el-tag>
                    </template>
                    <template #default>
                      <div style="display: flex; gap: 10px; flex-direction: column">
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
                <el-button link type="primary" size="small" @click="onDormTableViewRoomClick(scope.row)">查看房间
                </el-button>
                <el-button link type="danger" size="small" @click="onDormTableDelClick(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 页码组件 -->
        <div class="pagination-div">
          <el-pagination class="pagination" :page-size="tabDormPages?.size" layout="total, prev, pager, next, sizes"
                         :current-page="tabDormsCurrentPage" :total="tabDormPages?.totalData"
                         @current-change="onDormTableCurrentPageChange" @size-change="onDormTableSizeChangChange"/>
        </div>


        <!-- 修改宿舍对话框 -->
        <el-dialog v-model="tabDormDialogEditDormVisible" title="编辑宿舍" draggable>
          <el-form class="register-form" :model="tabDormDialogEditDormForm" label-position="left" label-width="85px">
            <el-form-item label="宿舍楼名">
              <el-input v-model="tabDormDialogEditDormForm.name" placeholder="宿舍楼名称"></el-input>
            </el-form-item>
            <el-form-item label="管理该宿舍">
              <el-switch v-model="tabDormDialogEditDormForm.isAdminValue"/>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="tabDormDialogEditDormVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogEditDormSaveClick">保存</el-button>
            </span>
          </template>
        </el-dialog>


        <!-- 添加宿舍对话框 -->
        <el-dialog v-model="tabDormDialogAddDormVisible" title="添加宿舍" draggable>
          <el-form class="register-form" :model="tabDormDialogAddDormForm" label-position="left" label-width="85px">
            <el-form-item label="宿舍楼名">
              <el-input v-model="tabDormDialogAddDormForm.name" placeholder="宿舍楼名称"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="tabDormDialogAddDormVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogAddDormSaveClick">添加</el-button>
            </span>
          </template>
        </el-dialog>
      </el-tab-pane>


      <!-- 宿舍房间选项卡 -->
      <el-tab-pane label="宿舍房间">
        <div class="button-group">
          <el-select v-model="tabRoomCurrentSelectDorm" @change="onTabRoomDormSelectChange" placeholder="选择宿舍楼"
                     style="width: 200px; margin-right: 10px;">
            <el-option v-for="dorm in tabRoomDorms" :label="dorm.name" :value="dorm.dormitoryId"/>
          </el-select>
          <el-button plain type="primary" @click="onTabRoomToolBarAddRoomClick">添加房间</el-button>
          <el-button type="danger" plain @click="onTabRoomToolBarDeleteClick"
                     :disabled="tabRoomSelectedRooms == null || tabRoomSelectedRooms.length == 0">删除
          </el-button>
        </div>
        <div class="table">
          <!-- 表格，显示宿舍楼 -->
          <el-table class="table" :data="tabRoomPages?.data" border height="70vh"
                    @selection-change="onTabRoomTableSelectChange"
                    :default-sort="{ prop: 'birth', order: 'descending' }">
            <el-table-column type="selection" width="55"/>
            <el-table-column fixed prop="name" label="房间名" width="130"/>
            <el-table-column fixed prop="totalBeds" label="总床位" width="130" sortable/>
            <el-table-column fixed prop="headCount" label="入住人数" width="130" sortable/>
            <el-table-column fixed="right" label="房间住户">
              <template #default="scope">
                <div>
                  <el-popover :width="300" :title="user.name" v-for="user in scope.row.users" :key="user.userId">
                    <template #reference>
                      <el-tag round @click="onDormTableUserTagClick(user.id)"
                              style="margin-right: 5px; cursor: pointer;">
                        {{ user.name }}
                      </el-tag>
                    </template>
                    <template #default>
                      <div style="display: flex; gap: 10px; flex-direction: column">
                        <p>性别：{{ user.gender === GenderEnum.MALE ? '男' : '女' }}</p>
                        <p>学号：{{ user.id }}</p>
                        <p>电话：{{ user.phone }}</p>
                      </div>
                    </template>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180">
              <template #default=scope>
                <el-button link type="primary" size="small" @click="onTabRoomTableEditClick(scope.row)">编辑</el-button>
                <el-button link type="primary" size="small" @click="onTabRoomTableAddStudentClick(scope.row)">修改住户
                </el-button>
                <el-button link type="danger" size="small" @click="onTabRoomTableDelClick(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 页码组件 -->
        <div class="pagination-div">
          <el-pagination class="pagination" :page-size="tabRoomPages?.size" layout="total, prev, pager, next, sizes"
                         :current-page="tabRoomsCurrentPage" :total="tabRoomPages?.totalData"
                         @current-change="onRoomTableCurrentPageChange" @size-change="onRoomTableSizeChangChange"/>
        </div>


        <!-- 添加宿舍房间对话框 -->
        <el-dialog v-model="tabRoomDialogAddRoomVisible" title="添加房间" draggable>
          <el-form class="register-form" :model="tabRoomDialogAddRoomForm" label-position="left" label-width="85px">
            <el-form-item label="宿舍楼">
              <el-select v-model="tabRoomDialogAddRoomForm.dormId" placeholder="选择宿舍楼"
                         style="width: 200px; margin-right: 10px;">
                <el-option v-for="dorm in tabRoomDorms" :label="dorm.name" :value="dorm.dormitoryId"/>
              </el-select>
            </el-form-item>
            <el-form-item label="房间名">
              <el-input v-model="tabRoomDialogAddRoomForm.roomName"
                        placeholder="房间名（多个房间用英文逗号隔开）"></el-input>
            </el-form-item>
            <el-form-item label="房间床位">
              <el-input v-model="tabRoomDialogAddRoomForm.totalBeds" placeholder="房间可用床位"
                        type="number"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="tabRoomDialogAddRoomVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogAddRoomSaveClick">添加</el-button>
            </span>
          </template>
        </el-dialog>


        <!-- 修改宿舍对话框 -->
        <el-dialog v-model="tabRoomDialogEditRoomVisible" title="编辑房间" draggable>
          <el-form class="register-form" :model="tabRoomDialogEditRoomForm" label-position="left" label-width="85px">
            <el-form-item label="房间名">
              <el-input v-model="tabRoomDialogEditRoomForm.roomName" placeholder="房间名称"></el-input>
            </el-form-item>
            <el-form-item label="总床位">
              <el-input v-model="tabRoomDialogEditRoomForm.totalBeds" placeholder="房间总床位" type="number"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="tabRoomDialogEditRoomVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogEditRoomSaveClick">保存</el-button>
            </span>
          </template>
        </el-dialog>


        <!-- 添加学生对话框 -->
        <el-dialog v-model="tabRoomDialogAddStudentVisible" title="添加学生" draggable>
          <el-form class="register-form" :model="tabRoomDialogAddStudentForm" label-position="left" label-width="85px">
            <el-form-item label="房间名">
              <el-input v-model="tabRoomDialogAddStudentForm.roomName" readonly />
            </el-form-item>
            <el-form-item label="选择学生">
              <el-select
                  v-model="tabRoomDialogAddStudentForm.value"
                  multiple
                  filterable
                  remote
                  reserve-keyword
                  clearable
                  placeholder="关键字：学号、姓名、电话"
                  :multiple-limit="tabRoomDialogAddStudentForm.totalBeds"
                  :remote-method="tabRoomDialogAddStudentGetStudents"
                  :loading="tabRoomDialogAddStudentForm.loading"
              >
                <el-option
                    v-for="stu in tabRoomDialogAddStudentForm.students"
                    :key="stu.value.userId"
                    :label="stu.label"
                    :value="stu.value.userId"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="tabRoomDialogAddStudentVisible = false">取消</el-button>
              <el-button type="primary" @click="onDialogAddStudentSaveClick">保存</el-button>
            </span>
          </template>
        </el-dialog>
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