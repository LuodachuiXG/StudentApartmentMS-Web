import {Room} from "../models/Room";
import {User} from "../models/User";
import service from "./index"

/**
 * 添加宿舍楼
 * 仅管理员
 * @param dormName 宿舍楼名
 */
export function addDorm(dormName: string) {
    return service({
        url: '/dorm',
        method: 'POST',
        data: [dormName]
    });
}

/**
 * 分页获取宿舍楼
 * 仅管理员
 * @param page 当前页
 * @param size 每页大小
 */
export function dormsByPage(page: number, size: number) {
    return service({
        url: `/dorm/${page}/${size}`,
        method: 'GET'
    });
}

/**
 * 获取所有宿舍楼
 * 仅管理员
 */
export function allDorms() {
    return service({
        url: '/dorm',
        method: 'GET'
    });
}

/**
 * 添加宿舍管理员
 * 仅管理员
 * @param dormId 宿舍楼 ID
 * @param admins 要添加的管理员
 */
export function addDormAdmins(dormId: number, admins: Array<User>) {
    return service({
        url: '/dorm/admin',
        method: 'POST',
        data: {
            dormitoryId: dormId,
            admins: admins
        }
    });
}

/**
 * 删除宿舍管理员
 * 仅管理员
 * @param dormId 宿舍楼 ID
 * @param admins 要删除的管理员
 */
export function delDormAdmins(dormId: number, admins: Array<User>) {
    return service({
        url: '/dorm/admin',
        method: 'DELETE',
        data: {
            dormitoryId: dormId,
            admins: admins
        }
    });
}

/**
 * 修改宿舍楼
 * 仅管理员
 * @param dormId 宿舍楼 ID
 * @param name 宿舍楼名
 */
export function updateDorm(dormId: number, name: string) {
    return service({
        url: '/dorm',
        method: 'PUT',
        data: {
            dormitoryId: dormId,
            name: name
        }
    });
}

/**
 * 删除宿舍楼
 * 仅管理员
 * @param dormId 宿舍楼 ID
 */
export function delDorm(dormId: number) {
    return service({
        url: '/dorm',
        method: 'DELETE',
        data: [dormId]
    });
}


/**
 * 分页获取宿舍房间
 * 仅管理员
 * @param dormId 宿舍楼 ID
 * @param page 当前页
 * @param size 每页大小
 */
export function roomsByPage(dormId: number, page: number, size: number) {
    return service({
        url: `/dorm/room/${dormId}/${page}/${size}`,
        method: 'GET'
    });
}

/**
 * 添加宿舍房间
 * 仅管理员
 * @param rooms 房间对象数组（仅填充 dormitoryId、name、totalBeds 三个字段）
 */
export function addRooms(rooms: Array<Room>) {
    return service({
        url: '/dorm/room',
        method: 'POST',
        data: rooms
    });
}

/**
 * 删除宿舍房间
 * 仅管理员
 * @param roomIds 房间 ID 数组
 */
export function delRooms(roomIds: Array<number>) {
    return service({
        url: '/dorm/room',
        method: 'DELETE',
        data: roomIds
    });
}

/**
 * 修改宿舍房间
 * 仅管理员
 * @param dormId 宿舍楼 ID
 * @param roomId 房间 ID
 * @param name 房间名
 * @param totalBeds 房间总床位
 */
export function updateRoom(dormId: number, roomId: number, name: string, totalBeds: number) {
    return service({
        url: '/dorm/room',
        method: 'PUT',
        data: {
            dormitoryId: dormId,
            roomId: roomId,
            name: name,
            totalBeds: totalBeds
        }
    });
}