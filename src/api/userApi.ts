import service from "./index"

/**
 * 用户登录
 * @param id 工号（学号）
 * @param password 密码
 */
export function login(id: string, password: string) {
    return service({
        url: '/user/login',
        method: 'POST',
        data: {
            id: id,
            password: password
        }
    });
}


/**
 * 用户注册，仅用于注册管理员
 * 学生用户由管理员添加
 * @param name 姓名
 * @param id 工号
 * @param password 密码
 * @param phone 手机号
 * @param gender 性别：male / female
 * @param birth 生日
 */
export function register(name: string, id: string, password: string,
    phone: string, gender: string, birth: string) {
    const data = {
        name: name,
        id: id,
        password: password,
        phone: phone,
        gender: gender,
        birth: birth
    };
    return service({
        url: '/user',
        method: 'POST',
        data: data
    });
}

/**
 * 添加学生
 * 学生用户由管理员添加
 * @param name 姓名
 * @param id 学号
 * @param phone 手机号
 * @param gender 性别：MALE / FEMALE
 * @param birth 生日
 */
export function addStudent(name: string, id: string, phone: string,
    gender: string, birth: string) {
    const data = {
        name: name,
        id: id,
        phone: phone,
        gender: gender,
        birth: birth
    };
    return service({
        url: '/user/student',
        method: 'POST',
        data: data
    });
}

/**
 * 获取所有用户
 * 仅管理员
 */
export function allUsers() {
    return service({
        url: '/user',
        method: 'GET'
    });
}

/**
 * 分页获取用户
 * 仅管理员
 * @param page 当前页
 * @param size 每页大小
 */
export function userByPage(page: number, size: number) {
    return service({
        url: `/user/${page}/${size}`,
        method: 'GET'
    });
}


/**
 * 分页和关键词获取用户信息
 * 关键词：工号（学号）、姓名、电话
 * 仅管理员
 * @param key 查询的关键词
 * @param page 当前页数
 * @param size 每页大小
 */
export function userByKeyAndPage(key: string, page: number, size: number) {
    return service({
        url: `/user/${key}/${page}/${size}`,
        method: 'GET'
    });
}

/**
 * 批量删除用户
 * 仅管理员
 * @param userIds 用户 ID 集合
 */
export function deleteUsers(userIds: Array<number>) {
    return service({
        url: '/user',
        method: 'DELETE',
        data: userIds
    });
}

/**
 * 修改用户
 * 管理员不能修改其他管理员信息，但可以修改学生信息
 * 学生只能修改自己的信息
 * @param name 姓名
 * @param id 工号（学号）
 * @param password 密码（为空不修改）
 * @param phone 手机号
 * @param gender 性别
 * @param birth 出生日期
 * @returns 
 */
export function updateUser(userId: number, name: string,
    id: string, password: string, phone: string,
    gender: string, birth: string) {
    const data = {
        userId: userId,
        name: name,
        id: id,
        password: password,
        phone: phone,
        gender: gender,
        birth: birth
    };
    return service({
        url: '/user',
        method: 'PUT',
        data: data
    });
}

/**
 * 修改密码
 * 此接口只能修改密码的用户本人调用
 * @param oldPwd 旧密码
 * @param newPwd 新密码
 * @returns 
 */
export function updateUserPassword(oldPwd: string, newPwd: string) {
    return service({
        url: '/user/password',
        method: 'PUT',
        data: {
            oldPwd: oldPwd,
            newPwd: newPwd
        }
    });
}

