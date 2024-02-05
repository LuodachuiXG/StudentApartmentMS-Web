import service from "./index"

/**
 * 添加留言
 *
 * @param dormId 宿舍楼 ID
 * @param content 留言内容
 * @param top 是否置顶（仅管理员）
 */
export function addMsg(dormId: number, content: string, top: boolean) {
    return service({
        url: '/msg',
        method: 'POST',
        data: {
            dormitoryId: dormId,
            content: content,
            top: top
        }
    });
}

/**
 * 删除留言
 * 管理员可以删除所有人留言，学生只能删除自己的留言。
 *
 * @param msgId 留言板 ID
 */
export function delMsg(msgId: number) {
    return service({
        url: `/msg/${msgId}`,
        method: 'DELETE'
    });
}

/**
 * 分页获取宿舍楼所有留言
 * 仅管理员
 *
 * @param dormId 宿舍楼 ID
 * @param page 当前页
 * @param size 每页条数
 */
export function getMsgByPage(dormId: number, page: number, size: number) {
    return service({
        url: `/msg/${dormId}/${page}/${size}`,
        method: 'GET'
    });
}

/**
 * 根据用户 ID 获取宿舍楼置顶留言
 * 如果 userId 是管理员，就获取他管理的宿舍的置顶留言
 * 如果 userId 是学生，就获取他入住宿舍的置顶留言
 *
 * @param userId 用户 ID
 */
export function getTopMsgByUserId(userId: number) {
    return service({
        url: `/msg/top/${userId}`,
        method: 'GET'
    });
}