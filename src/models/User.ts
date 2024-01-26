import { RoleEnum } from "./RoleEnum";

/**
 * 用户实体类接口
 */
export interface User {
    userId: number;
    name: string;
    id: string;
    password: string,
    role: RoleEnum;
    phone: string;
    gender: string;
    birth: string;
    lastLogin: string;
    token: string;
}