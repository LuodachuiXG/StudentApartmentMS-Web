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
 * 用户注册，此接口只能用于注册管理员
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
 * 获取所有用户（该接口只有管理员可以调用）
 */
export function allUsers() {
    return service({
        url: '/user',
        method: 'GET'
    });
}

/**
 * 分页获取用户（该接口只有管理员可以调用）
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
 * 分页获取用户（该接口只有管理员可以调用）
 * @param ids 用户 ID 集合
 */
export function deleteUsers(ids: Array<number>) {
    return service({
        url: '/user',
        method: 'DELETE',
        data: ids
    });
}

