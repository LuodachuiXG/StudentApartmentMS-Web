import {GenderEnum} from "./GenderEnum";
import {RoleEnum} from "./RoleEnum";

/**
 * 用户实体类接口
 */
export interface User {
    // 用户 ID
    userId: number;
    // 姓名
    name: string;
    // 工号（学号）
    id: string;
    // 密码
    password: string,
    // 身份
    role: RoleEnum;
    // 手机
    phone: string;
    // 性别
    gender: GenderEnum;
    // 出生日期
    birth: string;
    // 最后登录时间
    lastLogin: string;
    // 登录凭证
    token: string;
}