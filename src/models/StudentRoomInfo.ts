import {User} from "./User";

/**
 * 学生入住房间信息实体类
 */
export interface StudentRoomInfo {
    // 宿舍楼名
    dormName: string;
    // 宿舍楼 ID
    dormId: number,
    // 房间名
    roomName: string;
    // 房间总床位数
    totalBeds: number;
    // 宿舍楼管理员
    admins: Array<User>;
    // 舍友
    roomMates: Array<User>;
}