import {User} from "./User.ts";

/**
 * 宿舍房间实体类接口
 */
export interface Room {
    // 房间 ID
    roomId: number;
    // 宿舍楼 ID
    dormitoryId: number;
    // 房间名
    name: string;
    // 房间已入住人数
    headCount: number
    // 房间总床位
    totalBeds: number;
    // 房间住户
    users: Array<User> | null;
}