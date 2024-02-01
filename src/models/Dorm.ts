import {User} from "./User";

/**
 * 宿舍楼实体类接口
 */
export interface Dorm {
    // 宿舍楼 ID
    dormitoryId: number;
    // 宿舍楼名
    name: string;
    // 宿舍楼总床位
    totalBeds: number
    // 宿舍楼已入住人数
    headCount: number;
    // 宿舍楼管理员
    admins: Array<User>;
}