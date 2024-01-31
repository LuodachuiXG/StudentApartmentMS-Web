import service from "./index"

/**
 * 分页获取宿舍
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
