import { RoleEnum } from "./RoleEnum";

/**
 * 用户实体类接口
 */
export interface User {
    userId: number;
    name: string;
    id: string;
    role: RoleEnum;
    phone: string;
    gender: string;
    birth: Date;
    lastLogin: Date;
    token: string;
}