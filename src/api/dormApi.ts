import { User } from "../models/User";
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
export function dormByPage(page: number, size: number) {
    return service({
        url: `/dorm/${page}/${size}`,
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
