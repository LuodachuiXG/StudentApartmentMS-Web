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
    })
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
    return service({
        url: '/user',
        method: 'POST',
        data: {
            name: name, 
            id: id, 
            password: password,
            phone: phone, 
            gender: gender, 
            birth: birth
        }
    })
}

/**
 * 获取所有用户（该接口只有管理员可以调用）
 */
export function allUsers() {
    return service({
        url: '/user',
        method: 'GET'
    })
}