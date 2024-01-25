/**
 * 用户实体类接口
 */
export interface User {
    userId: number;
    name: string;
    id: string;
    role: string;
    phone: string;
    gender: string;
    birth: Date;
    lastLogin: Date;
    token: string;
}